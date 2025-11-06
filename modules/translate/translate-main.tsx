"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Copy, Link2, Send, Cpu, X } from "lucide-react";
import { useState } from "react";

const ALLOWED_MODELS = [
  "gemini-2.0-flash-exp",
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
] as const;

interface TranslateResult {
  message: string;
  audioInfo: {
    fileName: string;
    fileSize: number;
    fileSizeFormatted: string;
    mimeType: string;
    url: string;
  };
  aiResponse: {
    pinyin: string;
    china: string;
    vietnamese: string;
  };
  model: string;
  timestamp: string;
  hasAudioFile: boolean;
}

export default function TranslateMain() {
  const [voiceUrl, setVoiceUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>(ALLOWED_MODELS[0]);
  const [result, setResult] = useState<TranslateResult | null>(null);

  const handleRemoveFile = () => {
    setSelectedFile(null);
    // Reset input file
    const fileInput = document.getElementById(
      "file-upload"
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Model Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            Chọn model AI
          </CardTitle>
          <CardDescription>
            Lựa chọn model Gemini để xử lý chuyển đổi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="model-select">Model</Label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger id="model-select">
                <SelectValue placeholder="Chọn model" />
              </SelectTrigger>
              <SelectContent>
                {ALLOWED_MODELS.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">
              Model hiện tại:{" "}
              <span className="font-semibold">{selectedModel}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Input Methods */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Upload File */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Tải file lên
            </CardTitle>
            <CardDescription>
              Chọn file audio từ thiết bị của bạn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Chọn file audio</Label>
              <Input
                id="file-upload"
                type="file"
                accept="audio/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">
                Hỗ trợ: MP3, WAV, M4A, AAC, OGG, FLAC và các định dạng audio
                khác
              </p>
            </div>
            {selectedFile && (
              <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-medium">File đã chọn:</p>
                    <p className="text-sm text-muted-foreground break-all">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={handleRemoveFile}
                    className="shrink-0 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            <Button className="w-full" disabled={!selectedFile}>
              <Send className="mr-2 h-4 w-4" />
              Chuyển đổi
            </Button>
          </CardContent>
        </Card>

        {/* Voice URL */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Nhập URL
            </CardTitle>
            <CardDescription>
              Nhập link Google Drive hoặc URL audio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="voice-url">URL của file audio</Label>
              <Input
                id="voice-url"
                type="url"
                placeholder="https://drive.google.com/file/d/..."
                value={voiceUrl}
                onChange={(e) => setVoiceUrl(e.target.value)}
              />
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">
                Hỗ trợ: Google Drive
              </p>
            </div>
            <Button className="w-full" disabled={!voiceUrl}>
              <Send className="mr-2 h-4 w-4" />
              Chuyển đổi
            </Button>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Results */}
      {result && result.aiResponse && (
        <div className="space-y-6">
          {/* Chinese */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">中文</CardTitle>
                <Button size="sm" variant="outline">
                  <Copy className="mr-2 h-4 w-4" />
                  Sao chép
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <p className="text-lg leading-relaxed whitespace-pre-wrap">
                  {result.aiResponse.china}
                </p>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Pinyin */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">Pinyin</CardTitle>
                <Button size="sm" variant="outline">
                  <Copy className="mr-2 h-4 w-4" />
                  Sao chép
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <p className="text-lg leading-relaxed">
                  {result.aiResponse.pinyin}
                </p>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Vietnamese */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">Tiếng Việt</CardTitle>
                <Button size="sm" variant="outline">
                  <Copy className="mr-2 h-4 w-4" />
                  Sao chép
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <p className="text-lg leading-relaxed">
                  {result.aiResponse.vietnamese}
                </p>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
