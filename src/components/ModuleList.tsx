import React from "react";
import ModuleItem from "./ModuleItem";

interface ModuleListItem {
  id?: string;
  name: string;
  description?: string;
}

interface ModuleListProps {
  items: ModuleListItem[];
  onItemClick: (item: ModuleListItem, index: number) => void;
  actionLabel?: string;
  numbered?: boolean;
  secondaryAction?: (item: ModuleListItem) => { label: string; onClick: () => void };
  emptyMessage?: string;
}

const ModuleList: React.FC<ModuleListProps> = ({
  items,
  onItemClick,
  actionLabel,
  numbered = true,
  secondaryAction,
  emptyMessage = "No modules available yet.",
}) => {
  if (!items || items.length === 0) {
    return (
      <div className="module-empty">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="module-list">
      {items.map((item, index) => (
        <ModuleItem
          key={item.id || index}
          title={item.name}
          description={item.description}
          onClick={() => onItemClick(item, index)}
          actionLabel={actionLabel}
          index={numbered ? index : undefined}
          secondaryAction={secondaryAction ? secondaryAction(item) : undefined}
        />
      ))}
    </div>
  );
};

export default ModuleList;
