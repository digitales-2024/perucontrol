"use client";

import { useState, useEffect, useRef } from "react";
import { PlusCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useFormContext } from "react-hook-form";
import { type CompleteReportDTO, type TextBlock, type TextArea } from "@/app/(admin)/projects/[id]/evento/[app_id]/informes/schemas";

type TextContent = {
    type: "content";
    id: string;
    text: string;
    visualNumbering: string;
};

type Section = {
    type: "section";
    id: string;
    title: string;
    visualNumbering: string;
    level: number;
    children: Array<Section | TextContent>;
};

export default function ReportBuilder({startNumbering}: {startNumbering: string})
{
    const { setValue, watch } = useFormContext<CompleteReportDTO>();
    const content = watch("content");
    const isUpdatingRef = useRef(false);

    const generateId = () => Math.random().toString(36)
        .substring(2, 9);

    const [report, setReport] = useState<Array<Section>>([
        {
            type: "section",
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
            const baseNumber = parseInt(startNumbering, 10);
            const transformedContent = content.map((section, index) =>
            {
                if (section.$type === "textBlock")
                {
                    const textBlock = section as TextBlock;
                    const sectionNumber = baseNumber + index;
                    const newSection: Section = {
                        type: "section",
                        id: generateId(),
                        title: textBlock.title,
                        visualNumbering: `${sectionNumber}`,
                        level: textBlock.level,
                        children: textBlock.sections.map((subsection, subIndex) =>
                        {
                            if (subsection.$type === "textBlock")
                            {
                                return {
                                    type: "section",
                                    id: generateId(),
                                    title: subsection.title,
                                    visualNumbering: `${sectionNumber}.${subIndex + 1}`,
                                    level: subsection.level,
                                    children: subsection.sections.map((content, contentIndex) =>
                                    {
                                        if (content.$type === "textBlock")
                                        {
                                            return {
                                                type: "content",
                                                id: generateId(),
                                                text: content.title,
                                                visualNumbering: `${sectionNumber}.${subIndex + 1}.${contentIndex + 1}`,
                                            };
                                        }
                                        return {
                                            type: "content",
                                            id: generateId(),
                                            text: "",
                                            visualNumbering: `${sectionNumber}.${subIndex + 1}.${contentIndex + 1}`,
                                        };
                                    }),
                                };
                            }
                            return {
                                type: "section",
                                id: generateId(),
                                title: "",
                                visualNumbering: `${sectionNumber}.${subIndex + 1}`,
                                level: textBlock.level + 1,
                                children: [],
                            };
                        }),
                    };
                    return newSection;
                }
                const textArea = section as TextArea;
                const newContent: TextContent = {
                    type: "content",
                    id: generateId(),
                    text: textArea.content,
                    visualNumbering: startNumbering,
                };
                return newContent;
            }).filter((item): item is Section => item.type === "section");

            setReport(transformedContent);
        }
    }, [content, startNumbering]);

    // Efecto para actualizar el formulario cuando cambia el reporte
    useEffect(() =>
    {
        if (isUpdatingRef.current) return;

        isUpdatingRef.current = true;
        const transformedContent: Array<TextBlock> = report.map((section) => ({
            $type: "textBlock" as const,
            title: section.title,
            numbering: "1", // Siempre enviamos "1" al backend
            level: section.level,
            sections: section.children.map((child): TextBlock =>
            {
                if (child.type === "section")
                {
                    const sectionChild = child as Section;
                    return {
                        $type: "textBlock" as const,
                        title: sectionChild.title,
                        numbering: "1", // Siempre enviamos "1" al backend
                        level: sectionChild.level,
                        sections: sectionChild.children.map((content): TextBlock =>
                        {
                            if (content.type === "content")
                            {
                                const contentChild = content as TextContent;
                                return {
                                    $type: "textBlock" as const,
                                    title: contentChild.text,
                                    numbering: "1", // Siempre enviamos "1" al backend
                                    level: sectionChild.level + 1,
                                    sections: [],
                                };
                            }
                            const sectionContent = content as Section;
                            return {
                                $type: "textBlock" as const,
                                title: sectionContent.title,
                                numbering: "1", // Siempre enviamos "1" al backend
                                level: sectionChild.level + 1,
                                sections: [],
                            };
                        }),
                    };
                }
                if (child.type === "content")
                {
                    const contentChild = child as TextContent;
                    return {
                        $type: "textBlock" as const,
                        title: contentChild.text,
                        numbering: "1", // Siempre enviamos "1" al backend
                        level: section.level + 1,
                        sections: [],
                    };
                }
                return {
                    $type: "textBlock" as const,
                    title: "",
                    numbering: "1", // Siempre enviamos "1" al backend
                    level: section.level + 1,
                    sections: [],
                };
            }),
        }));
        setValue("content", transformedContent);
    }, [report, setValue]);

    const addMainSection = () =>
    {
        const baseNumber = parseInt(startNumbering, 10);
        const newSection: Section = {
            type: "section",
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

            const updatedChildren = section.children.map((child) =>
            {
                if (child.type === "section")
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
        const update = (sections: Array<Section>): Array<Section> => sections.map((section) => ({
            ...section,
            children: section.children.map((child) =>
            {
                if (child.type === "content" && child.id === id)
                {
                    return { ...child, text };
                }
                if (child.type === "section")
                {
                    return {
                        ...child,
                        children: update([child]).flatMap((s) => s.children),
                    };
                }
                return child;
            }),
        }));

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
                return node;
            });

        setReport((prev) => removeById(prev) as Array<Section>);
    };

    const renderSection = (section: Section) => (
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
                {section.children.map((child) =>
                {
                    if (child.type === "section")
                    {
                        return renderSection(child);
                    }
                    return (
                        <div key={child.id} className="mb-4 bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center">
                                <span className="text-sm font-medium text-slate-600 flex-1">
                                    Contenido de texto
                                </span>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => deleteItem(child.id)}
                                    className="h-8 px-3"
                                >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Eliminar
                                </Button>
                            </div>
                            <div className="p-3">
                                <Textarea
                                    value={child.text}
                                    onChange={(e) => updateContent(child.id, e.target.value)}
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
                })}
            </div>
        </div>
    );

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

    /* const renderSection = (section: Section) => (
        <div key={section.id} className="mb-4 pl-4 border-l-2">
            <div className="flex flex-wrap items-center gap-2 mb-2">
                <div className="flex-1 flex items-center">
                    <span className="text-sm text-center font-medium text-gray-500 min-w-[2rem]">
                        {section.visualNumbering}
                    </span>
                    <Input
                        value={section.title}
                        onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                        placeholder="Título"
                        className="flex-1"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addSubsection(section.id, section.level)}
                    >
                        <PlusCircle className="h-4 w-4" />
                        {" "}
                        Subsección
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addContent(section.id)}
                    >
                        <PlusCircle className="h-4 w-4" />
                        {" "}
                        Contenido
                    </Button>
                    <Button
                        type="button"
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
                            <div className="flex items-start gap-2">
                                <Textarea
                                    value={child.text}
                                    onChange={(e) => updateContent(child.id, e.target.value)}
                                    rows={6}
                                    placeholder="Contenido"
                                    className="flex-1"
                                />
                            </div>
                            <div className="flex justify-end mt-2">
                                <Button
                                    type="button"
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
                <Button
                    type="button"
                    onClick={addMainSection}
                    className="mt-4"
                >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Agregar Sección Principal
                </Button>
            </div>
        </div>
    ); */
}
