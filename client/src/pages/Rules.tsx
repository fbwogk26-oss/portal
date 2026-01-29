import { useNotices, useCreateNotice, useDeleteNotice } from "@/hooks/use-notices";
import { useLockStatus } from "@/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, Plus, Trash2, AlertCircle, Search, ImagePlus, X } from "lucide-react";
import { useState, useMemo, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export default function Rules() {
  const { data: rules, isLoading } = useNotices("rule");
  const { mutate: createRule, isPending: isCreating } = useCreateNotice();
  const { mutate: deleteRule } = useDeleteNotice();
  const { data: lockData } = useLockStatus();
  const isLocked = lockData?.isLocked;
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredRules = useMemo(() => {
    if (!rules) return [];
    if (!searchQuery.trim()) return rules;
    const query = searchQuery.toLowerCase();
    return rules.filter(rule => 
      rule.title.toLowerCase().includes(query) || 
      rule.content.toLowerCase().includes(query)
    );
  }, [rules, searchQuery]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.imageUrl) {
        setImageUrl(data.imageUrl);
        toast({ title: "이미지 업로드 완료" });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "업로드 실패" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAdd = () => {
    if (!title || !content) return;
    createRule({ title, content, category: "rule", imageUrl: imageUrl || undefined }, {
      onSuccess: () => {
        setTitle("");
        setContent("");
        setImageUrl(null);
        toast({ title: "수칙 추가 완료", description: "새로운 안전 수칙이 게시되었습니다." });
      }
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("이 수칙을 삭제하시겠습니까?")) {
      deleteRule(id);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-xl text-primary">
              <ShieldCheck className="w-8 h-8" />
            </div>
            안전 수칙
          </h2>
          <p className="text-muted-foreground mt-2">필수 안전 프로토콜 및 가이드라인입니다.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Input 
            placeholder="수칙 검색..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pr-9"
            data-testid="input-search-rules"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      <Card className="glass-card overflow-hidden">
        <div className="p-1 bg-primary/5 border-b border-primary/10">
           <div className="px-4 py-1 text-xs font-semibold text-primary uppercase tracking-wider">새 수칙 등록</div>
        </div>
        <CardContent className="p-6 space-y-4">
          <Input 
            placeholder="수칙 제목 (예: 필수 보호구 착용)" 
            value={title} 
            onChange={e => setTitle(e.target.value)}
            disabled={isLocked}
            className="font-medium"
            data-testid="input-rule-title"
          />
          <Textarea 
            placeholder="안전 수칙에 대한 상세 설명을 입력하세요..." 
            value={content} 
            onChange={e => setContent(e.target.value)}
            disabled={isLocked}
            className="min-h-[100px]"
            data-testid="input-rule-content"
          />
          
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="hidden"
            data-testid="input-rule-image"
          />
          
          {imageUrl ? (
            <div className="relative inline-block">
              <img src={imageUrl} alt="미리보기" className="max-h-32 rounded-lg border" />
              <Button
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6"
                onClick={() => setImageUrl(null)}
                data-testid="button-remove-rule-image"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLocked || isUploading}
              className="gap-2"
              data-testid="button-add-rule-image"
            >
              <ImagePlus className="w-4 h-4" />
              {isUploading ? "업로드 중..." : "이미지 추가"}
            </Button>
          )}
          
          <div className="flex justify-end">
            <Button onClick={handleAdd} disabled={isLocked || isCreating || !title} className="gap-2" data-testid="button-add-rule">
              <Plus className="w-4 h-4" /> 수칙 추가
            </Button>
          </div>
          {isLocked && (
            <div className="flex items-center gap-2 text-xs text-red-500 bg-red-50 p-2 rounded-lg border border-red-100">
              <AlertCircle className="w-4 h-4" /> 시스템이 잠겨 있습니다. 편집이 비활성화되었습니다.
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-32 bg-muted/20 rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <AnimatePresence>
            {filteredRules.map((rule) => (
              <motion.div
                key={rule.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group relative bg-card rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-md transition-all duration-300"
                data-testid={`card-rule-${rule.id}`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold font-display text-primary">{rule.title}</h3>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {rule.createdAt && format(new Date(rule.createdAt), "yyyy-MM-dd")}
                      </span>
                    </div>
                    <p className="text-foreground/80 leading-relaxed">{rule.content}</p>
                    {rule.imageUrl && (
                      <img 
                        src={rule.imageUrl} 
                        alt="첨부 이미지" 
                        className="max-w-full max-h-64 rounded-lg border mt-2"
                      />
                    )}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDelete(rule.id)}
                    disabled={isLocked}
                    data-testid={`button-delete-rule-${rule.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        {!isLoading && filteredRules.length === 0 && (
          <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-2xl border border-dashed">
            {searchQuery ? `"${searchQuery}"에 대한 검색 결과가 없습니다.` : "아직 등록된 수칙이 없습니다."}
          </div>
        )}
      </div>
    </div>
  );
}
