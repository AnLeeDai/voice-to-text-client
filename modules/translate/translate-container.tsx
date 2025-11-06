"use client";

import TranslateHistory from "./translate-history";
import TranslateMain from "./translate-main";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Mic, History } from "lucide-react";
import { useTranslateVoice } from "@/api/hooks/use-translate-voice";

interface TranslateContainerProps {
  readonly children?: React.ReactNode;
}

export default function TranslateContainer({
  children,
}: TranslateContainerProps) {
  const { mutate: mutateTranslateVoice } = useTranslateVoice();

  return (
    <div>
      <div className="mb-8 text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">
          Voice to Text Converter
        </h1>
        <p className="text-muted-foreground text-lg">
          Chuyển đổi giọng nói của bạn thành văn bản một cách nhanh chóng và
          chính xác
        </p>
        <div className="flex justify-center gap-2">
          <Badge variant="secondary">Real-time</Badge>
          <Badge variant="secondary">High Accuracy</Badge>
          <Badge variant="secondary">Multi-language</Badge>
        </div>
      </div>

      <Tabs defaultValue="translate" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="translate" className="flex items-center gap-2">
            <Mic className="h-4 w-4" />
            Chuyển đổi
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Lịch sử
          </TabsTrigger>
        </TabsList>

        <TabsContent value="translate" className="mt-6">
          <Card>
            <CardContent>
              <TranslateMain onTranslateVoice={mutateTranslateVoice} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardContent>
              <TranslateHistory />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {children}
    </div>
  );
}
