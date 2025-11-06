"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  History,
  Trash2,
  Copy,
  Calendar,
  FileAudio,
  Cpu,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  getHistory,
  clearHistory,
  deleteHistoryItem,
  HistoryItem,
} from "@/helpers/history-storage";

export default function TranslateHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const historyData = getHistory();
    setHistory(historyData);
  };

  const handleClearAll = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử?")) {
      clearHistory();
      setHistory([]);
      toast.success("Đã xóa toàn bộ lịch sử");
    }
  };

  const handleDeleteItem = (id: string) => {
    deleteHistoryItem(id);
    setHistory(history.filter((item) => item.id !== id));
    toast.success("Đã xóa item khỏi lịch sử");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Đã sao chép vào clipboard!");
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="rounded-full bg-muted p-6">
          <AlertCircle className="h-12 w-12 text-muted-foreground" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">Chưa có lịch sử</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Các bản dịch của bạn sẽ được lưu lại tại đây. Hãy bắt đầu chuyển đổi
            file audio đầu tiên!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <History className="h-6 w-6" />
            Lịch sử chuyển đổi
          </h2>
          <p className="text-sm text-muted-foreground">
            Tổng cộng {history.length} bản dịch
          </p>
        </div>
        <Button variant="destructive" size="sm" onClick={handleClearAll}>
          <Trash2 className="mr-2 h-4 w-4" />
          Xóa tất cả
        </Button>
      </div>

      <Separator />

      {/* History List */}
      <div className="space-y-4">
        {history.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <CardHeader
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => toggleExpand(item.id)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="text-lg">
                      {item.audioInfo.fileName}
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      <FileAudio className="mr-1 h-3 w-3" />
                      {item.audioInfo.fileSizeFormatted}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Cpu className="mr-1 h-3 w-3" />
                      {item.model}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    {formatDate(item.timestamp)}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteItem(item.id);
                  }}
                  className="hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            {expandedId === item.id && (
              <CardContent className="space-y-6 pt-6">
                {/* Chinese */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-lg">
                      中文 (Tiếng Trung)
                    </h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(item.aiResponse.china)}
                    >
                      <Copy className="mr-2 h-3 w-3" />
                      Sao chép
                    </Button>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {item.aiResponse.china}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Pinyin */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-lg">Pinyin</h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(item.aiResponse.pinyin)}
                    >
                      <Copy className="mr-2 h-3 w-3" />
                      Sao chép
                    </Button>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {item.aiResponse.pinyin}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Vietnamese */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-lg">Tiếng Việt</h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        copyToClipboard(item.aiResponse.vietnamese)
                      }
                    >
                      <Copy className="mr-2 h-3 w-3" />
                      Sao chép
                    </Button>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {item.aiResponse.vietnamese}
                    </p>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
