import { useNotices, useCreateNotice, useDeleteNotice } from "@/hooks/use-notices";
import { useLockStatus } from "@/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Plus, Trash2, FileText } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export default function Education() {
  const { data: materials, isLoading } = useNotices("edu");
  const { mutate: createMaterial, isPending: isCreating } = useCreateNotice();
  const { mutate: deleteMaterial } = useDeleteNotice();
  const { data: lockData } = useLockStatus();
  const isLocked = lockData?.isLocked;
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleAdd = () => {
    if (!title || !content) return;
    createMaterial({ title, content, category: "edu" }, {
      onSuccess: () => {
        setTitle("");
        setContent("");
        toast({ title: "자료 추가 완료", description: "교육 자료가 게시되었습니다." });
      }
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("이 자료를 삭제하시겠습니까?")) deleteMaterial(id);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-xl text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <GraduationCap className="w-8 h-8" />
            </div>
            안전 교육
          </h2>
          <p className="text-muted-foreground mt-2">훈련 자료 및 안전 문서를 관리합니다.</p>
        </div>
      </div>

      <Card className="glass-card overflow-hidden border-blue-200 dark:border-blue-900/30">
        <CardContent className="p-6 space-y-4">
          <Input 
            placeholder="자료 제목" 
            value={title} 
            onChange={e => setTitle(e.target.value)}
            disabled={isLocked}
          />
          <Textarea 
            placeholder="내용 설명, 링크 또는 요약..." 
            value={content} 
            onChange={e => setContent(e.target.value)}
            disabled={isLocked}
          />
          <div className="flex justify-end">
            <Button onClick={handleAdd} disabled={isLocked || isCreating || !title} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
              <Plus className="w-4 h-4" /> 자료 추가
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence>
          {materials?.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="group bg-card rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-full"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-lg dark:bg-blue-900/20">
                    <FileText className="w-6 h-6" />
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="opacity-0 group-hover:opacity-100"
                    onClick={() => handleDelete(item.id)}
                    disabled={isLocked}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1 line-clamp-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-4">{item.content}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t text-xs text-muted-foreground flex justify-between items-center">
                <span>게시일: {item.createdAt && format(new Date(item.createdAt), "yyyy-MM-dd")}</span>
                <span className="bg-secondary px-2 py-1 rounded">상세 보기</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
