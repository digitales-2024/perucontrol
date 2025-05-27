"use client";

import { useState, useEffect, useRef } from "react";
import { PlusCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useFormContext } from "react-hook-form";
import { type CompleteReportDTO, ContentSection } from "@/app/(admin)/projects/[id]/evento/[app_id]/informes/schemas";

type LocalContentSection = TextContent | Section;
type TextContent = {
    type: "textArea";
    id: string;
    text: string;
    visualNumbering: string;
};

type Section = {
    type: "textBlock";
    id: string;
    title: string;
    visualNumbering: string;
    level: number;
    children: Array<LocalContentSection>;
};

const generateId = () => Math.random().toString(36)
    .substring(2, 9);

export default function ReportBuilder({startNumbering}: {startNumbering: string})
{
    console.log(startNumbering);
    const { setValue, watch } = useFormContext<CompleteReportDTO>();
    const content = watch("content");
    const isUpdatingRef = useRef(false);

    const [report, setReport] = useState<Array<LocalContentSection>>([
        {
            type: "textBlock",
            id: "1",
            title: "",
            visualNumbering: startNumbering ?? "1",
            level: 0,
            children: [],
        },
    ]);

    // Efecto para sincronizar el estado local con el formulario
    useEffect(() =>
    {
        if (isUpdatingRef.current)
        {
            isUpdatingRef.current = false;
            return;
        }

        if (content && content.length > 0)
        {
            const transformedContent = content.map((section, index) =>
            {
                if (section.$type === "textBlock")
                {
                    const baseNumber = parseInt(startNumbering, 10);
                    const sectionNumber = baseNumber + index;
                    const newSection: Section = {
                        type: "textBlock",
                        id: generateId(),
                        title: section.title,
                        visualNumbering: `${sectionNumber}`,
                        level: section.level,
                        children: section.sections.map((subsection, subIndex) =>
                        {
                            if (subsection.$type === "textBlock")
                            {
                                const newSubsection: Section = {
                                    type: "textBlock",
                                    id: generateId(),
                                    title: subsection.title,
                                    visualNumbering: `${sectionNumber}.${subIndex + 1}`,
                                    level: subsection.level,
                                    children: subsection.sections.map((content, contentIndex) =>
                                    {
                                        if (content.$type === "textBlock")
                                        {
                                            const newContent: TextContent = {
                                                type: "textArea",
                                                id: generateId(),
                                                text: content.title,
                                                visualNumbering: `${sectionNumber}.${subIndex + 1}.${contentIndex + 1}`,
                                            };
                                            return newContent;
                                        }
                                        const newContent: TextContent = {
                                            type: "textArea",
                                            id: generateId(),
                                            text: content.content,
                                            visualNumbering: `${sectionNumber}.${subIndex + 1}.${contentIndex + 1}`,
                                        };
                                        return newContent;
                                    }),
                                };
                                return newSubsection;
                            }
                            const newContent: TextContent = {
                                type: "textArea",
                                id: generateId(),
                                text: subsection.content,
                                visualNumbering: `${sectionNumber}.${subIndex + 1}`,
                            };
                            return newContent;
                        }),
                    };
                    return newSection;
                }
                const newContent: TextContent = {
                    type: "textArea",
                    id: generateId(),
                    text: section.content,
                    visualNumbering: startNumbering,
                };
                return newContent;
            });

            setReport(transformedContent);
        }
    }, [content, startNumbering]);

    // Efecto para actualizar el formulario cuando cambia el reporte
    useEffect(() =>
    {
        if (isUpdatingRef.current) return;

        isUpdatingRef.current = true;
        const transformedContent: Array<ContentSection> = report.map((section) =>
        {
            if (section.type === "textBlock")
            {
                return {
                    $type: "textBlock",
                    title: section.title,
                    numbering: section.visualNumbering,
                    level: section.level,
                    sections: section.children.map((child) =>
                    {
                        if (child.type === "textBlock")
                        {
                            return {
                                $type: "textBlock",
                                title: child.title,
                                numbering: child.visualNumbering,
                                level: child.level,
                                sections: child.children.map((content) =>
                                {
                                    if (content.type === "textArea")
                                    {
                                        return {
                                            $type: "textArea",
                                            content: content.text,
                                        };
                                    }
                                    return {
                                        $type: "textBlock",
                                        title: content.title,
                                        numbering: content.visualNumbering,
                                        level: child.level + 1,
                                        sections: [],
                                    };
                                }),
                            };
                        }
                        return {
                            $type: "textArea",
                            content: child.text,
                        };
                    }),
                };
            }
            return {
                $type: "textArea",
                content: section.text,
            };
        });

        setValue("content", transformedContent);
    }, [report, setValue]);

    const addMainSection = () =>
    {
        const baseNumber = parseInt(startNumbering, 10);
        const newSection: Section = {
            type: "textBlock",
            id: generateId(),
            title: "",
            visualNumbering: `${baseNumber + report.length}`,
            level: 0,
            children: [],
        };
        setReport((prev) => [...prev, newSection]);
    };

    const addSubsection = (parentId: string, parentLevel: number) =>
    {
        const updateSections = (nodes: Array<LocalContentSection>): Array<LocalContentSection> => nodes.map((node) =>
        {
            if (node.type === "textBlock")
            {
                if (node.id === parentId)
                {
                    const siblingSections = node.children.filter((child) => child.type === "textBlock").length;

                    const newSection: Section = {
                        type: "textBlock",
                        id: generateId(),
                        title: "",
                        visualNumbering: `${node.visualNumbering}.${siblingSections + 1}`,
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

        setReport((prev) => updateSections(prev));
    };

    const addContent = (parentId: string) =>
    {
        const updateSections = (nodes: Array<LocalContentSection>): Array<LocalContentSection> => nodes.map((node) =>
        {
            if (node.type === "textBlock")
            {
                if (node.id === parentId)
                {
                    const newContent: TextContent = {
                        type: "textArea",
                        id: generateId(),
                        text: "",
                        visualNumbering: node.visualNumbering,
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

        setReport((prev) => updateSections(prev));
    };

    const updateSectionTitle = (id: string, title: string) =>
    {
        const update = (sections: Array<LocalContentSection>): Array<LocalContentSection> => sections.map((section) =>
        {
            if (section.type === "textBlock" && section.id === id)
            {
                return { ...section, title };
            }

            if (section.type === "textArea")
            {
                return section;
            }

            const updatedChildren = section.children.map((child) =>
            {
                if (child.type === "textBlock")
                {
                    const updatedSection = update([child])[0];
                    return updatedSection;
                }
                return child;
            });

            return {
                ...section,
                children: updatedChildren,
            };
        });

        setReport((prev) => update(prev));
    };

    const updateContent = (id: string, text: string) =>
    {
        const update = (sections: Array<LocalContentSection>): Array<LocalContentSection> => sections.map((section) =>
        {
            if (section.type === "textArea")
            {
                return section;
            }
            else
            {
                return {
                    ...section, children: section.children.map((child) =>
                    {
                        if (child.type === "textArea" && child.id === id)
                        {
                            return {
                                ...child, text,
                            };
                        }
                        if (child.type === "textBlock")
                        {
                            return {
                                ...child,
                                children: update([child]).flatMap((s) => (s.type === "textArea" ? s : s.children)),
                            };
                        }
                        return child;
                    }),
                };
            }
        });

        setReport((prev) => update(prev));
    };

    const deleteItem = (id: string) =>
    {
        const isMainSection = report.some((section) => section.id === id);
        if (isMainSection && report.length === 1)
        {
            toast.error("No se puede eliminar la única sección principal");
            return;
        }

        const removeById = (nodes: Array<LocalContentSection>): Array<LocalContentSection> => nodes
            .filter((node) => node.id !== id)
            .map((node) =>
            {
                if (node.type === "textBlock")
                {
                    return {
                        ...node,
                        children: removeById(node.children),
                    };
                }
                return node;
            });

        setReport((prev) => removeById(prev));
    };

    const renderSection = (section: LocalContentSection) =>
    {
        if (section.type === "textArea")
        {
            return (
                <div key={section.id} className="mb-3 group">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Contenido
                        </span>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteItem(section.id)}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    </div>
                    <Textarea
                        value={section.text}
                        onChange={(e) => updateContent(section.id, e.target.value)}
                        onKeyDown={(e) =>
                        {
                            if (e.key === "Enter" && !e.shiftKey)
                            {
                                e.preventDefault();
                            }
                        }}
                        rows={4}
                        placeholder="Escribe el contenido aquí..."
                        className="w-full text-sm border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-y min-h-[100px] bg-gray-50 focus:bg-white transition-colors"
                    />
                </div>
            );
        }

        return (
            <div key={section.id} className="mb-4 group">
                <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center justify-center text-xs font-bold bg-blue-100 text-blue-700 rounded-full h-6 min-w-[1.5rem] px-2">
                        {section.visualNumbering}
                    </span>
                    <Input
                        value={section.title}
                        onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                        onKeyDown={(e) =>
                        {
                            if (e.key === "Enter")
                            {
                                e.preventDefault();
                            }
                        }}
                        placeholder="Título de la sección"
                        className="flex-1 text-sm font-medium border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-8 bg-white"
                    />
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => addSubsection(section.id, section.level)}
                            className="h-7 px-2 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 hover:text-blue-800 border border-blue-200"
                        >
                            <PlusCircle className="h-3 w-3 mr-1" />
                            Sub
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => addContent(section.id)}
                            className="h-7 px-2 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 hover:text-green-800 border border-green-200"
                        >
                            <PlusCircle className="h-3 w-3 mr-1" />
                            Texto
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteItem(section.id)}
                            className="h-7 w-7 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50"
                        >
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    </div>
                </div>

                {section.children.length > 0 && (
                    <div className="ml-6 pl-3 border-l-2 border-gray-300 space-y-2">
                        {section.children.map((child) => renderSection(child))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="border border-gray-300 rounded-lg bg-white shadow-sm">
            <div className="px-4 py-3 border-b border-gray-300 bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-800">
                    Estructura del informe
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                    Organiza las secciones y contenidos de tu informe
                </p>
            </div>
            <div className="p-4 space-y-3">
                {report.map(renderSection)}
                <Button
                    type="button"
                    onClick={addMainSection}
                    variant="outline"
                    className="w-full mt-4 h-9 text-sm border-dashed border-gray-400 text-gray-600 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50"
                >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Agregar Sección Principal
                </Button>
            </div>
        </div>
    );
}
