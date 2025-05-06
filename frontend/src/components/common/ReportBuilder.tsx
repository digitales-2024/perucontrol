"use client";

import { useState } from "react";
import { PlusCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type TextContent = {
  type: "content";
  id: string;
  text: string;
};

type Section = {
  type: "section";
  id: string;
  title: string;
  numbering: string;
  level: number;
  children: Array<Section | TextContent>;
};

export default function ReportBuilder()
{
    const [report, setReport] = useState<Array<Section>>([
        {
            type: "section",
            id: "1",
            title: "",
            numbering: "1",
            level: 0,
            children: [],
        },
    ]);

    const generateId = () => Math.random().toString(36)
        .substring(2, 9);

    const addSubsection = (parentId: string, parentLevel: number) =>
    {
        const updateSections = (nodes: Array<Section | TextContent>): Array<Section | TextContent> => nodes.map((node) =>
        {
            if (node.type === "section")
            {
                if (node.id === parentId)
                {
                    const siblingSections = node.children.filter((child) => child.type === "section").length;

                    const newSection: Section = {
                        type: "section",
                        id: generateId(),
                        title: "",
                        numbering: `${node.numbering}.${siblingSections + 1}`,
                        level: parentLevel + 1,
                        children: [],
                    };

                    return {
                        ...node,
                        children: [...node.children, newSection],
                    };
                }
                return {
                    ...node,
                    children: updateSections(node.children),
                };
            }
            return node;
        });

        setReport((prev) => updateSections(prev) as Array<Section>);
    };

    const addContent = (parentId: string) =>
    {
        const updateSections = (nodes: Array<Section | TextContent>): Array<Section | TextContent> => nodes.map((node) =>
        {
            if (node.type === "section")
            {
                if (node.id === parentId)
                {
                    const newContent: TextContent = {
                        type: "content",
                        id: generateId(),
                        text: "",
                    };

                    return {
                        ...node,
                        children: [...node.children, newContent],
                    };
                }
                return {
                    ...node,
                    children: updateSections(node.children),
                };
            }
            return node;
        });

        setReport((prev) => updateSections(prev) as Array<Section>);
    };

    const updateSectionTitle = (id: string, title: string) =>
    {
        const update = (sections: Array<Section>): Array<Section> => sections.map((section) =>
        {
            if (section.id === id)
            {
                return { ...section, title };
            }
            return {
                ...section,
                children: update(section.children as Array<Section>),
            };
        });

        setReport((prev) => update(prev));
    };

    const updateContent = (id: string, text: string) =>
    {
        const update = (sections: Array<Section>): Array<Section> => sections.map((section) => ({
            ...section,
            children: section.children.map((child) =>
            {
                if (child.type === "content" && child.id === id)
                {
                    return { ...child, text };
                }
                return child;
            }),
        }));

        setReport((prev) => update(prev));
    };

    const deleteItem = (id: string) =>
    {
        const removeById = (nodes: Array<Section | TextContent>): Array<Section | TextContent> => nodes
            .filter((node) => node.id !== id)
            .map((node) =>
            {
                if (node.type === "section")
                {
                    return {
                        ...node,
                        children: removeById(node.children),
                    };
                }
                else
                {
                    return node;
                }
            });

        setReport((prev) => removeById(prev) as Array<Section>);
    };

    const renderSection = (section: Section) => (
        <div key={section.id} className="mb-4 pl-4 border-l-2">
            <div className="flex items-center gap-2 mb-2">
                <Input
                    value={section.title}
                    onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                    placeholder={`${section.numbering}. Título`}
                    className="flex-1"
                />
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addSubsection(section.id, section.level)}
                    >
                        <PlusCircle className="h-4 w-4" />
                        {" "}
                        Subsección
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addContent(section.id)}
                    >
                        <PlusCircle className="h-4 w-4" />
                        {" "}
                        Contenido
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteItem(section.id)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="pl-4">
                {section.children.map((child) =>
                {
                    if (child.type === "section")
                    {
                        return renderSection(child);
                    }
                    return (
                        <div key={child.id} className="mb-2">
                            <Textarea
                                value={child.text}
                                onChange={(e) => updateContent(child.id, e.target.value)}
                                placeholder="Contenido"
                                className="w-full"
                            />
                            <div className="flex justify-end mt-2">
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => deleteItem(child.id)}
                                >
                                    Eliminar contenido
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="p-4 border rounded-lg">
            <div className="space-y-4">
                {report.map(renderSection)}
                {/* <Button
                    onClick={() => addSubsection("root", 0)}
                    className="mt-4"
                >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Agregar sección principal
                </Button> */}
            </div>
        </div>
    );
}
