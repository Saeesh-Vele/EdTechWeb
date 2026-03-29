import React from "react";

interface ModuleItemProps {
  title: string;
  description?: string;
  onClick?: () => void;
  actionLabel?: string;
  index?: number;
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

const ModuleItem: React.FC<ModuleItemProps> = ({
  title,
  description,
  onClick,
  actionLabel = "View Details",
  index,
  secondaryAction,
}) => {
  return (
    <div className="module-item" onClick={onClick}>
      <div className="module-left">
        <div className="module-number">
          {index !== undefined ? index + 1 : <div className="module-dot" />}
        </div>
      </div>

      <div className="module-content">
        <h3 className="module-title">{title}</h3>
        {description && <p className="module-desc">{description}</p>}
      </div>

      <div className="module-actions">
        {secondaryAction && (
          <button
            className="module-action-btn module-action-btn--secondary"
            onClick={(e) => {
              e.stopPropagation();
              secondaryAction.onClick();
            }}
          >
            {secondaryAction.label}
          </button>
        )}
        <button
          className="module-action-btn"
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
};

export default ModuleItem;
