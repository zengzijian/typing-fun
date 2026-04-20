import { useSearchParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ModelViewer from "../components/ModelViewer";
import { MODEL_LIST } from "../data/models";

const ModelDetail = () => {
  const [searchParams] = useSearchParams();
  const name = searchParams.get("name");
  const model = MODEL_LIST.find((m) => m.id === name);

  if (!model) {
    return (
      <div className="min-h-full bg-background text-foreground flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">未找到模型「{name}」</p>
        <Link
          to="/models"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← 返回模型库
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background text-foreground flex flex-col h-[calc(100vh-56px)]">
      <div className="flex items-center gap-3 px-6 py-3 border-b border-border">
        <Link
          to="/models"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          返回
        </Link>
        <span className="text-border">|</span>
        <span className="text-sm font-medium text-foreground">{model.name}</span>
        <span className="text-muted-foreground text-sm">{model.description}</span>
      </div>
      <div className="flex-1">
        <ModelViewer autoRotate={false}>{model.component}</ModelViewer>
      </div>
    </div>
  );
};

export default ModelDetail;
