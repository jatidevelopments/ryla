'use client';

import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ryla/ui';
import { Sparkles, LayoutGrid } from 'lucide-react';
import { TemplateLibraryTab } from './template-library-tab';

export interface TemplateTabsProps {
  influencerId: string;
  onTemplateApply: (templateId: string) => void;
  defaultTab?: 'generate' | 'templates';
  generateContent: React.ReactNode;
}

export function TemplateTabs({
  influencerId,
  onTemplateApply,
  defaultTab = 'generate',
  generateContent,
}: TemplateTabsProps) {
  const [activeTab, setActiveTab] = React.useState(defaultTab);

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'generate' | 'templates')}>
      <TabsList className="mb-4">
        <TabsTrigger value="generate" className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Generate
        </TabsTrigger>
        <TabsTrigger value="templates" className="flex items-center gap-2">
          <LayoutGrid className="h-4 w-4" />
          Templates
        </TabsTrigger>
      </TabsList>

      <TabsContent value="generate" className="mt-0">
        {generateContent}
      </TabsContent>

      <TabsContent value="templates" className="mt-0">
        <TemplateLibraryTab
          influencerId={influencerId}
          onTemplateApply={(templateId) => {
            onTemplateApply(templateId);
            setActiveTab('generate');
          }}
        />
      </TabsContent>
    </Tabs>
  );
}

