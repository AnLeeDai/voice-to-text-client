import { Separator } from "@/components/ui/separator";
import { Github, Mail, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t mt-auto">
      <div className="py-8 container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold mb-3">Voice to Text</h3>
            <p className="text-sm text-muted-foreground">
              Chuyển đổi giọng nói thành văn bản một cách nhanh chóng và chính
              xác
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Liên kết</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Trang chủ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Hướng dẫn
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Về chúng tôi
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Liên hệ</h3>
            <div className="flex gap-4">
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        <Separator className="my-6" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2025 Voice to Text. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="h-4 w-4 fill-current" /> for better
            transcription
          </p>
        </div>
      </div>
    </footer>
  );
}
