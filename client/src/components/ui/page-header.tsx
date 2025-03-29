import React from 'react';

interface PageHeaderProps {
  heading: string;
  description?: string;
  rightSection?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  heading,
  description,
  rightSection,
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{heading}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {rightSection && <div>{rightSection}</div>}
    </div>
  );
};