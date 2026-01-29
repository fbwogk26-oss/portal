import { useNotices, useCreateNotice, useDeleteNotice, useUpdateNotice } from "@/hooks/use-notices";
import { useLockStatus } from "@/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HardHat, Plus, Trash2, Building2, ChevronLeft, Save, Package, Shield, Wrench, Box, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";

const TEAMS = ["동대구운용팀", "서대구운용팀", "남대구운용팀", "포항운용팀", "안동운용팀", "구미운용팀", "문경운용팀"];

const CATEGORIES = [
  { id: "보호구", label: "보호구", icon: Shield, color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20" },
  { id: "안전용품", label: "안전용품", icon: Wrench, color: "text-green-600 bg-green-50 dark:bg-green-900/20" },
  { id: "기타품목", label: "기타품목", icon: Box, color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20" },
];

const STATUS_OPTIONS = [
  { id: "등록", label: "등록", color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20", icon: CheckCircle },
  { id: "양호", label: "양호", color: "text-green-600 bg-green-50 dark:bg-green-900/20", icon: CheckCircle },
  { id: "불량", label: "불량", color: "text-red-600 bg-red-50 dark:bg-red-900/20", icon: XCircle },
];

const DEFAULT_EQUIPMENT_LIST = [
  { name: "안전모(일반)", quantity: 0, category: "보호구", status: "등록" },
  { name: "일반안전화", quantity: 0, category: "보호구", status: "등록" },
  { name: "하계안전화", quantity: 0, category: "보호구", status: "등록" },
  { name: "실내안전화", quantity: 0, category: "보호구", status: "등록" },
  { name: "안전장화", quantity: 0, category: "보호구", status: "등록" },
  { name: "안전대(복합식)", quantity: 0, category: "보호구", status: "등록" },
  { name: "절연장갑", quantity: 0, category: "보호구", status: "등록" },
  { name: "안전모(임업)", quantity: 0, category: "보호구", status: "등록" },
  { name: "안전모(신호수)", quantity: 0, category: "보호구", status: "등록" },
  { name: "추락방지대(로프식)", quantity: 0, category: "보호구", status: "등록" },
  { name: "추락방지대(와이어식)", quantity: 0, category: "보호구", status: "등록" },
  { name: "휴대용소화기", quantity: 0, category: "안전용품", status: "등록" },
  { name: "반사조끼(주황색조끼)", quantity: 0, category: "안전용품", status: "등록" },
  { name: "수평구명줄SET", quantity: 0, category: "안전용품", status: "등록" },
  { name: "비상용삼각대", quantity: 0, category: "안전용품", status: "등록" },
  { name: "접이식 라바콘", quantity: 0, category: "안전용품", status: "등록" },
  { name: "차량 고임목", quantity: 0, category: "안전용품", status: "등록" },
  { name: "A형사다리", quantity: 0, category: "기타품목", status: "등록" },
  { name: "아웃트리거", quantity: 0, category: "기타품목", status: "등록" },
  { name: "블랙박스", quantity: 0, category: "기타품목", status: "등록" },
  { name: "후방센서", quantity: 0, category: "기타품목", status: "등록" },
  { name: "후방카메라", quantity: 0, category: "기타품목", status: "등록" },
];

interface EquipmentItem {
  name: string;
  quantity: number;
  category: string;
  status: string;
}

export default function EquipmentStatus() {
  const { data: statusRecords, isLoading } = useNotices("equip_status");
  const { mutate: createRecord, isPending: isCreating } = useCreateNotice();
  const { mutate: deleteRecord } = useDeleteNotice();
  const { mutate: updateRecord, isPending: isUpdating } = useUpdateNotice();
  const { data: lockData } = useLockStatus();
  const isLocked = lockData?.isLocked;
  const { toast } = useToast();

  const [selectedTeam, setSelectedTeam] = useState("");
  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>(DEFAULT_EQUIPMENT_LIST);
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("보호구");
  const [editingRecordId, setEditingRecordId] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const teamRecord = statusRecords?.find(r => {
    try {
      const parsed = JSON.parse(r.content);
      return parsed.team === selectedTeam;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (teamRecord) {
      try {
        const parsed = JSON.parse(teamRecord.content);
        if (parsed.items && Array.isArray(parsed.items)) {
          const itemsWithFields = parsed.items.map((item: any) => ({
            ...item,
            category: item.category || getCategoryFromName(item.name),
            status: item.status || "등록"
          }));
          setEquipmentList(itemsWithFields);
          setEditingRecordId(teamRecord.id);
        }
      } catch {
        setEquipmentList(DEFAULT_EQUIPMENT_LIST);
        setEditingRecordId(null);
      }
    } else {
      setEquipmentList(DEFAULT_EQUIPMENT_LIST);
      setEditingRecordId(null);
    }
  }, [teamRecord, selectedTeam]);

  const getCategoryFromName = (name: string): string => {
    const defaultItem = DEFAULT_EQUIPMENT_LIST.find(item => item.name === name);
    return defaultItem?.category || "기타품목";
  };

  const handleQuantityChange = (index: number, value: string) => {
    const newList = [...equipmentList];
    newList[index].quantity = parseInt(value) || 0;
    setEquipmentList(newList);
  };

  const handleCategoryChange = (index: number, category: string) => {
    const newList = [...equipmentList];
    newList[index].category = category;
    setEquipmentList(newList);
  };

  const handleStatusChange = (index: number, status: string) => {
    const newList = [...equipmentList];
    newList[index].status = status;
    setEquipmentList(newList);
  };

  const handleAddItem = () => {
    if (!newItemName.trim()) return;
    if (equipmentList.some(item => item.name === newItemName.trim())) {
      toast({ variant: "destructive", title: "이미 존재하는 용품입니다." });
      return;
    }
    setEquipmentList([...equipmentList, { name: newItemName.trim(), quantity: 0, category: newItemCategory, status: "등록" }]);
    setNewItemName("");
    toast({ title: "용품 추가됨" });
  };

  const handleRemoveItem = (index: number) => {
    const newList = equipmentList.filter((_, i) => i !== index);
    setEquipmentList(newList);
  };

  const handleSave = () => {
    if (!selectedTeam) {
      toast({ variant: "destructive", title: "팀을 선택해주세요." });
      return;
    }

    const contentData = JSON.stringify({
      team: selectedTeam,
      items: equipmentList,
      lastUpdated: new Date().toISOString()
    });

    if (editingRecordId) {
      updateRecord({ id: editingRecordId, title: `${selectedTeam} 보호구 현황`, content: contentData }, {
        onSuccess: () => {
          toast({ title: "저장 완료", description: `${selectedTeam} 보호구 현황이 업데이트되었습니다.` });
        }
      });
    } else {
      createRecord({ title: `${selectedTeam} 보호구 현황`, content: contentData, category: "equip_status" }, {
        onSuccess: () => {
          toast({ title: "등록 완료", description: `${selectedTeam} 보호구 현황이 등록되었습니다.` });
        }
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("이 팀의 보호구 현황을 삭제하시겠습니까?")) {
      deleteRecord(id, {
        onSuccess: () => {
          setEditingRecordId(null);
          setEquipmentList(DEFAULT_EQUIPMENT_LIST);
          toast({ title: "삭제 완료" });
        }
      });
    }
  };

  const getStatusInfo = (status: string) => {
    return STATUS_OPTIONS.find(s => s.id === status) || STATUS_OPTIONS[0];
  };

  const getCategoryInfo = (categoryId: string) => {
    return CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[2];
  };

  const filteredEquipmentList = filterCategory === "all" 
    ? equipmentList 
    : equipmentList.filter(item => item.category === filterCategory);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/equipment">
          <Button variant="ghost" size="icon" className="shrink-0" data-testid="button-back">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-xl text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
              <Building2 className="w-8 h-8" />
            </div>
            팀별 보호구 현황
          </h2>
          <p className="text-muted-foreground mt-2">각 팀의 안전보호구 보유 수량 및 상태를 관리합니다.</p>
        </div>
      </div>

      <Card className="glass-card overflow-hidden border-amber-200 dark:border-amber-900/30">
        <CardHeader className="bg-amber-50/50 dark:bg-amber-900/10 border-b border-amber-100 dark:border-amber-900/20">
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-600" />
            팀 선택 및 현황 관리
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">팀 선택</label>
              <Select value={selectedTeam} onValueChange={setSelectedTeam} disabled={isLocked}>
                <SelectTrigger data-testid="select-team" className="w-full md:w-[280px]">
                  <SelectValue placeholder="팀을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {TEAMS.map(team => (
                    <SelectItem key={team} value={team}>{team}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedTeam && (
              <div className="flex gap-2">
                <Button 
                  onClick={handleSave} 
                  disabled={isLocked || isCreating || isUpdating} 
                  className="bg-amber-600 hover:bg-amber-700 text-white gap-2"
                  data-testid="button-save-status"
                >
                  <Save className="w-4 h-4" />
                  {isCreating || isUpdating ? "저장 중..." : "저장하기"}
                </Button>
                {editingRecordId && (
                  <Button 
                    variant="destructive"
                    onClick={() => handleDelete(editingRecordId)}
                    disabled={isLocked}
                    data-testid="button-delete-status"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {selectedTeam && (
            <>
              <div className="p-4 bg-muted/30 rounded-lg border">
                <label className="text-sm font-medium mb-3 block">새 용품 추가</label>
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="flex-1">
                    <Select value={newItemCategory} onValueChange={setNewItemCategory}>
                      <SelectTrigger data-testid="select-new-category" className="w-full md:w-[180px]">
                        <SelectValue placeholder="구분 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>
                            <div className="flex items-center gap-2">
                              <cat.icon className="w-4 h-4" />
                              {cat.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-[2]">
                    <Input 
                      placeholder="용품명 입력" 
                      value={newItemName} 
                      onChange={e => setNewItemName(e.target.value)}
                      disabled={isLocked}
                      data-testid="input-new-item"
                      onKeyDown={e => e.key === 'Enter' && handleAddItem()}
                    />
                  </div>
                  <Button 
                    onClick={handleAddItem} 
                    disabled={isLocked || !newItemName.trim()}
                    className="gap-2"
                    data-testid="button-add-item"
                  >
                    <Plus className="w-4 h-4" /> 추가
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium">구분 필터:</span>
                <Button 
                  variant={filterCategory === "all" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setFilterCategory("all")}
                >
                  전체
                </Button>
                {CATEGORIES.map(cat => (
                  <Button 
                    key={cat.id}
                    variant={filterCategory === cat.id ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setFilterCategory(cat.id)}
                    className="gap-1"
                  >
                    <cat.icon className="w-3 h-3" />
                    {cat.label}
                  </Button>
                ))}
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="font-bold w-12 text-center">#</TableHead>
                      <TableHead className="font-bold w-32">구분</TableHead>
                      <TableHead className="font-bold">용품명</TableHead>
                      <TableHead className="font-bold w-24 text-center">수량</TableHead>
                      <TableHead className="font-bold w-28 text-center">상태</TableHead>
                      <TableHead className="w-16"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {filteredEquipmentList.map((item, index) => {
                        const originalIndex = equipmentList.findIndex(e => e.name === item.name);
                        const statusInfo = getStatusInfo(item.status);
                        return (
                          <motion.tr
                            key={`${item.name}-${index}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="group hover:bg-muted/20"
                          >
                            <TableCell className="text-center text-muted-foreground font-mono">
                              {originalIndex + 1}
                            </TableCell>
                            <TableCell>
                              <Select 
                                value={item.category} 
                                onValueChange={(val) => handleCategoryChange(originalIndex, val)}
                                disabled={isLocked}
                              >
                                <SelectTrigger className="h-8 text-xs" data-testid={`select-category-${originalIndex}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {CATEGORIES.map(cat => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                      <div className="flex items-center gap-1">
                                        <cat.icon className="w-3 h-3" />
                                        {cat.label}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell className="text-center">
                              <Input
                                type="number"
                                min="0"
                                value={item.quantity}
                                onChange={e => handleQuantityChange(originalIndex, e.target.value)}
                                disabled={isLocked}
                                className="w-20 mx-auto text-center"
                                data-testid={`input-quantity-${originalIndex}`}
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <Select 
                                value={item.status} 
                                onValueChange={(val) => handleStatusChange(originalIndex, val)}
                                disabled={isLocked}
                              >
                                <SelectTrigger 
                                  className={`h-8 text-xs w-24 mx-auto ${statusInfo.color}`} 
                                  data-testid={`select-status-${originalIndex}`}
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {STATUS_OPTIONS.map(opt => (
                                    <SelectItem key={opt.id} value={opt.id}>
                                      <div className={`flex items-center gap-1 ${opt.color}`}>
                                        <opt.icon className="w-3 h-3" />
                                        {opt.label}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveItem(originalIndex)}
                                disabled={isLocked}
                                className="opacity-0 group-hover:opacity-100"
                                data-testid={`button-remove-item-${originalIndex}`}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                  <span>등록</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  <span>양호</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  <span>불량</span>
                </div>
              </div>
            </>
          )}

          {!selectedTeam && (
            <div className="text-center py-12 text-muted-foreground">
              <HardHat className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>팀을 선택하면 보호구 현황을 확인하고 수정할 수 있습니다.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-lg border-border/50 overflow-hidden">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle className="text-lg flex items-center gap-2">
            <HardHat className="w-5 h-5 text-amber-600" />
            전체 팀 현황 요약
          </CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-bold">팀명</TableHead>
                <TableHead className="font-bold text-center">보호구</TableHead>
                <TableHead className="font-bold text-center">안전용품</TableHead>
                <TableHead className="font-bold text-center">기타품목</TableHead>
                <TableHead className="font-bold text-center">양호</TableHead>
                <TableHead className="font-bold text-center">불량</TableHead>
                <TableHead className="font-bold">최종 수정일</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statusRecords?.map((record) => {
                try {
                  const parsed = JSON.parse(record.content);
                  const items = parsed.items || [];
                  const protectiveCount = items.filter((i: EquipmentItem) => (i.category || getCategoryFromName(i.name)) === "보호구").length;
                  const safetyCount = items.filter((i: EquipmentItem) => (i.category || getCategoryFromName(i.name)) === "안전용품").length;
                  const otherCount = items.filter((i: EquipmentItem) => (i.category || getCategoryFromName(i.name)) === "기타품목").length;
                  const goodCount = items.filter((i: EquipmentItem) => i.status === "양호").length;
                  const badCount = items.filter((i: EquipmentItem) => i.status === "불량").length;
                  return (
                    <TableRow key={record.id} className="hover:bg-muted/20">
                      <TableCell className="font-medium">{parsed.team}</TableCell>
                      <TableCell className="text-center">{protectiveCount}종</TableCell>
                      <TableCell className="text-center">{safetyCount}종</TableCell>
                      <TableCell className="text-center">{otherCount}종</TableCell>
                      <TableCell className="text-center">
                        <span className="text-green-600 font-medium">{goodCount}개</span>
                      </TableCell>
                      <TableCell className="text-center">
                        {badCount > 0 ? (
                          <span className="text-red-600 font-medium">{badCount}개</span>
                        ) : (
                          <span className="text-muted-foreground">0개</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {parsed.lastUpdated ? format(new Date(parsed.lastUpdated), "yyyy-MM-dd HH:mm") : "-"}
                      </TableCell>
                    </TableRow>
                  );
                } catch {
                  return null;
                }
              })}
              {(!statusRecords || statusRecords.length === 0) && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    등록된 팀별 현황이 없습니다. 팀을 선택하고 현황을 등록해주세요.
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
