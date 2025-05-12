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
                <div key={section.id} className="mb-4 bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center">
                        <span className="text-sm font-medium text-slate-600 flex-1">
                            Contenido de texto
                        </span>
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteItem(section.id)}
                            className="h-8 px-3"
                        >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Eliminar
                        </Button>
                    </div>
                    <div className="p-3">
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
                            rows={6}
                            placeholder="Escribe el contenido aquí..."
                            className="w-full border-slate-200 focus-visible:ring-slate-400 resize-y min-h-[150px]"
                        />
                    </div>
                </div>
            );
        }

        return (
            <div key={section.id} className="mb-6 pl-6 border-l-2 border-gray-200 hover:border-blue-400 transition-colors">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                    <div className="flex-1 flex items-center gap-2">
                        <span className="flex items-center justify-center text-sm font-semibold bg-slate-100 text-slate-700 rounded-md h-7 min-w-[2.5rem] px-2">
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
                            className="flex-1 border-slate-300 focus-visible:ring-slate-400 shadow-sm"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addSubsection(section.id, section.level)}
                            className="bg-white hover:bg-slate-50 text-slate-700 border-slate-300"
                        >
                            <PlusCircle className="h-4 w-4 mr-1 text-slate-500" />
                            Subsección
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addContent(section.id)}
                            className="bg-white hover:bg-slate-50 text-slate-700 border-slate-300"
                        >
                            <PlusCircle className="h-4 w-4 mr-1 text-slate-500" />
                            Contenido
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteItem(section.id)}
                            className="hover:bg-red-600"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="pl-5">
                    {section.children.map((child) => renderSection(child))}
                </div>
            </div>
        );
    };

    return (
        <div className="p-6 border border-slate-200 rounded-lg bg-white shadow-sm">
            <div className="mb-4">
                <h3 className="text-lg font-medium text-slate-800 mb-1">
                    Estructura del informe
                </h3>
                <p className="text-sm text-slate-500">
                    Crea y organiza las secciones y contenidos de tu informe
                </p>
            </div>
            <div className="space-y-4 divide-y divide-slate-100">
                {report.map(renderSection)}
            </div>
            <Button
                type="button"
                onClick={addMainSection}
                className="mt-6 bg-slate-800 hover:bg-slate-700 text-white"
            >
                <PlusCircle className="mr-2 h-4 w-4" />
                Agregar Sección Principal
            </Button>
        </div>
    );
}
