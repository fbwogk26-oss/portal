import { useNotices, useCreateNotice, useDeleteNotice } from "@/hooks/use-notices";
import { useLockStatus } from "@/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Plus, Trash2, Megaphone } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export default function Notices() {
  const { data: notices, isLoading } = useNotices("notice");
  const { mutate: createNotice, isPending: isCreating } = useCreateNotice();
  const { mutate: deleteNotice } = useDeleteNotice();
  const { data: lockData } = useLockStatus();
  const isLocked = lockData?.isLocked;
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleAdd = () => {
    if (!title || !content) return;
    createNotice({ title, content, category: "notice" }, {
      onSuccess: () => {
        setTitle("");
        setContent("");
        toast({ title: "공지 등록 완료", description: "상단 티커에 표시됩니다." });
      }
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("이 공지를 삭제하시겠습니까?")) deleteNotice(id);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
            <div className="bg-orange-100 p-2 rounded-xl text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
              <Megaphone className="w-8 h-8" />
            </div>
            공지 및 알림
          </h2>
          <p className="text-muted-foreground mt-2">시스템 전반의 공지사항 및 업데이트입니다.</p>
        </div>
      </div>

      <Card className="glass-card overflow-hidden border-orange-200 dark:border-orange-900/30">
        <CardContent className="p-6 space-y-4">
          <Input 
            placeholder="공지 제목" 
            value={title} 
            onChange={e => setTitle(e.target.value)}
            disabled={isLocked}
          />
          <Textarea 
            placeholder="메시지 내용..." 
            value={content} 
            onChange={e => setContent(e.target.value)}
            disabled={isLocked}
          />
          <div className="flex justify-end">
            <Button onClick={handleAdd} disabled={isLocked || isCreating || !title} className="bg-orange-600 hover:bg-orange-700 text-white gap-2">
              <Plus className="w-4 h-4" /> 공지 게시
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <AnimatePresence>
          {notices?.map((notice) => (
            <motion.div
              key={notice.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="group flex gap-4 bg-card rounded-2xl p-6 border border-border/50 shadow-sm items-start"
            >
              <div className="bg-muted w-12 h-12 rounded-full flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">{notice.title}</h3>
                  <span className="text-xs text-muted-foreground">
                    {notice.createdAt && format(new Date(notice.createdAt), "yyyy-MM-dd HH:mm")}
                  </span>
                </div>
                <p className="text-muted-foreground">{notice.content}</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="opacity-0 group-hover:opacity-100"
                onClick={() => handleDelete(notice.id)}
                disabled={isLocked}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
