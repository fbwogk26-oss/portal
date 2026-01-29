import { useNotices, useCreateNotice, useDeleteNotice } from "@/hooks/use-notices";
import { useLockStatus } from "@/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, Plus, Trash2, Upload, Download, FileSpreadsheet, X, ChevronLeft, Clock, CheckCircle2, XCircle } from "lucide-react";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";

const TEAMS = ["동대구운용팀", "서대구운용팀", "남대구운용팀", "포항운용팀", "안동운용팀", "구미운용팀", "문경운용팀"];

export default function EquipmentRequest() {
  const { data: requests, isLoading } = useNotices("equip_request");
  const { mutate: createRequest, isPending: isCreating } = useCreateNotice();
  const { mutate: deleteRequest } = useDeleteNotice();
  const { data: lockData } = useLockStatus();
  const isLocked = lockData?.isLocked;
  const { toast } = useToast();

  const [selectedTeam, setSelectedTeam] = useState("");
  const [requesterName, setRequesterName] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excelUrl, setExcelUrl] = useState<string | null>(null);
  const [excelName, setExcelName] = useState<string | null>(null);
  const [isExcelUploading, setIsExcelUploading] = useState(false);
  const excelInputRef = useRef<HTMLInputElement>(null);

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsExcelUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await fetch('/api/upload/file', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.fileUrl) {
        setExcelUrl(data.fileUrl);
        setExcelName(file.name);
        toast({ title: "엑셀 파일 업로드 완료" });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "업로드 실패" });
    } finally {
      setIsExcelUploading(false);
    }
  };

  const handleAdd = () => {
    if (!selectedTeam || !title || !requesterName) return;
    const contentData = JSON.stringify({
      team: selectedTeam,
      requester: requesterName,
      text: content,
      status: "pending",
      excelUrl: excelUrl,
      excelName: excelName,
    });
    createRequest({ title, content: contentData, category: "equip_request" }, {
      onSuccess: () => {
        setTitle("");
        setContent("");
        setSelectedTeam("");
        setRequesterName("");
        setExcelUrl(null);
        setExcelName(null);
        toast({ title: "신청 완료", description: "용품 신청이 등록되었습니다." });
      }
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("이 신청을 삭제하시겠습니까?")) deleteRequest(id);
  };

  const parseContent = (content: string) => {
    try {
      return JSON.parse(content);
    } catch {
      return { text: content };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-700 border-green-200"><CheckCircle2 className="w-3 h-3 mr-1" />승인</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" />반려</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" />대기중</Badge>;
    }
  };

  const filteredRequests = requests || [];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/equipment">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-xl text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
              <ShoppingCart className="w-8 h-8" />
            </div>
            용품 신청
          </h2>
          <p className="text-muted-foreground mt-2">안전보호구 및 용품을 신청합니다.</p>
        </div>
      </div>

      <Card className="glass-card overflow-hidden border-purple-200 dark:border-purple-900/30">
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">팀 선택</label>
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger data-testid="select-request-team">
                  <SelectValue placeholder="팀을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {TEAMS.map(team => (
                    <SelectItem key={team} value={team}>{team}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">신청자</label>
              <Input 
                placeholder="신청자 이름" 
                value={requesterName} 
                onChange={e => setRequesterName(e.target.value)}
                data-testid="input-request-name"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">신청 제목</label>
              <Input 
                placeholder="예: 안전모 10개 신청" 
                value={title} 
                onChange={e => setTitle(e.target.value)}
                data-testid="input-request-title"
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">상세 내용</label>
            <Textarea 
              placeholder="신청할 용품의 상세 내용을 입력하세요 (품목, 수량, 사유 등)..." 
              value={content} 
              onChange={e => setContent(e.target.value)}
              className="min-h-[100px]"
              data-testid="input-request-content"
            />
          </div>
          
          <input
            type="file"
            accept=".xlsx,.xls"
            ref={excelInputRef}
            onChange={handleExcelUpload}
            className="hidden"
            data-testid="input-request-excel"
          />

          <div className="flex flex-wrap gap-2">
            {excelUrl ? (
              <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
                <FileSpreadsheet className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-700 dark:text-green-400">{excelName}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => { setExcelUrl(null); setExcelName(null); }}
                  data-testid="button-remove-request-excel"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => excelInputRef.current?.click()}
                disabled={isExcelUploading}
                className="gap-2"
                data-testid="button-add-request-excel"
              >
                <Upload className="w-4 h-4" />
                {isExcelUploading ? "업로드 중..." : "신청 양식 첨부 (엑셀)"}
              </Button>
            )}
          </div>
          
          <div className="flex justify-end">
            <Button onClick={handleAdd} disabled={isCreating || !selectedTeam || !title || !requesterName} className="bg-purple-600 hover:bg-purple-700 text-white gap-2" data-testid="button-submit-request">
              <Plus className="w-4 h-4" /> 신청하기
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-border/50 overflow-hidden">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle className="text-lg flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-purple-600" />
            신청 내역
          </CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-bold">상태</TableHead>
                <TableHead className="font-bold">팀</TableHead>
                <TableHead className="font-bold">신청자</TableHead>
                <TableHead className="font-bold">제목</TableHead>
                <TableHead className="font-bold">내용</TableHead>
                <TableHead className="font-bold">신청일</TableHead>
                <TableHead className="font-bold text-center">첨부파일</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {filteredRequests.map((item) => {
                  const parsed = parseContent(item.content);
                  return (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="group hover:bg-muted/20"
                    >
                      <TableCell>{getStatusBadge(parsed.status)}</TableCell>
                      <TableCell className="font-medium">{parsed.team || "-"}</TableCell>
                      <TableCell>{parsed.requester || "-"}</TableCell>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell className="text-muted-foreground max-w-[150px] truncate">{parsed.text || "-"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {item.createdAt && format(new Date(item.createdAt), "yyyy-MM-dd")}
                      </TableCell>
                      <TableCell className="text-center">
                        {parsed.excelUrl ? (
                          <a 
                            href={parsed.excelUrl} 
                            download={parsed.excelName}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 border border-green-200 rounded text-green-700 hover:bg-green-100 transition-colors text-xs dark:bg-green-900/20 dark:border-green-800 dark:text-green-400"
                          >
                            <Download className="w-3 h-3" />
                            다운로드
                          </a>
                        ) : "-"}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                          className="opacity-0 group-hover:opacity-100"
                          data-testid={`button-delete-request-${item.id}`}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
              {filteredRequests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    신청 내역이 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
