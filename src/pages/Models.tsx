import { useNavigate } from "react-router-dom";
import ModelViewer from "../components/ModelViewer";
import { MODEL_LIST } from "../data/models";

const Models = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-full bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-xl font-semibold mb-1">模型库</h1>
        <p className="text-muted-foreground text-sm mb-8">
          点击模型进入预览，支持旋转与缩放
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {MODEL_LIST.map((model) => (
            <button
              key={model.id}
              onClick={() => navigate(`/model/detail?name=${model.id}`)}
              className="group rounded-lg overflow-hidden bg-card border border-border
                         hover:border-foreground/20 transition-colors text-left"
            >
              <div className="h-44 w-full">
                <ModelViewer autoRotate={false}>{model.component}</ModelViewer>
              </div>

              <div className="px-4 py-3 border-t border-border">
                <p className="font-medium text-sm text-foreground">{model.name}</p>
                <p className="text-muted-foreground text-xs mt-0.5 line-clamp-1">
                  {model.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Models;
