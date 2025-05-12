"use client";

import { useState, useEffect, useRef } from "react";
import { PlusCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useFormContext } from "react-hook-form";
import { type CompleteReportDTO, type TextBlock, type TextArea, ContentSection } from "@/app/(admin)/projects/[id]/evento/[app_id]/informes/schemas";

type LocalContentSection = TextContent | Section;
type TextContent = {
    type: "textArea";
    id: string;
    text: string;
    parentNumbering: string;
};

type Section = {
    type: "textBlock";
    id: string;
    title: string;
    numbering: string;
    level: number;
    children: Array<LocalContentSection>;
};

const generateId = () => Math.random().toString(36)
    .substring(2, 9);

export default function ReportBuilder()
{
    const { setValue, watch } = useFormContext<CompleteReportDTO>();
    const content = watch("content");
    const isUpdatingRef = useRef(false);

    const [report, setReport] = useState<Array<LocalContentSection>>(content.map(mapTargetToLocal));

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
            const transformedContent = content.map(mapTargetToLocal);

            setReport(transformedContent);
        }
    }, [content]);

    // Efecto para actualizar el formulario cuando cambia el reporte
    useEffect(() =>
    {
        if (isUpdatingRef.current) return;

        isUpdatingRef.current = true;

        // Map the local type to the expected type
        const transformedContent: Array<ContentSection> = report.map(mapLocalToTarget);

        setValue("content", transformedContent);
    }, [report, setValue]);

    const addMainSection = () =>
    {
        const newSection: Section = {
            type: "textBlock",
            id: generateId(),
            title: "",
            numbering: `${report.length + 1}`,
            level: 0,
            children: [],
        };
        setReport((prev) => [...prev, newSection]);
    };

    const addSubsection = (parentId: string, parentLevel: number) =>
    {
        const updateSections = (nodes: Array<Section | TextContent>): Array<Section | TextContent> => nodes.map((node) =>
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
            if (node.type === "textBlock")
            {
                if (node.id === parentId)
                {
                    const newContent: TextContent = {
                        type: "textArea",
                        id: generateId(),
                        text: "",
                        parentNumbering: node.numbering,
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
        const update = (sections: Array<LocalContentSection>): Array<LocalContentSection> => sections.map((section) =>
        {
            // Si encontramos la sección que queremos actualizar
            if (section.id === id)
            {
                return { ...section, title };
            }

            // Si no es la sección que buscamos, actualizamos sus hijos
            if (section.type === "textArea")
            {
                return section;
            }

            const updatedChildren = section.children.map((child) =>
            {
                if (child.type === "textBlock")
                {
                    // Si es una sección, actualizamos recursivamente
                    const updatedSection = update([child])[0];
                    return updatedSection;
                }
                // Si es contenido, lo dejamos igual
                return child;
            });

            // Retornamos la sección con sus hijos actualizados
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
                            const returnValue: TextContent = {
                                ...child, text,
                            };
                            return returnValue;
                        }
                        if (child.type === "textBlock")
                        {
                            const returnValue: Section = {
                                ...child,
                                children: update([child]).flatMap((s) => (s.type === "textArea" ? s : s.children)),
                            };
                            return returnValue;
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
        // Verificar si es una sección principal y si es la única
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
                if (node.type === "textBlock")
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

    const renderSection = (section: LocalContentSection) =>
    {
        if (section.type === "textArea")
        {
            return (
                <div key={section.id} className="mb-2">
                    <Textarea
                        value={section.text}
                        onChange={(e) => updateContent(section.id, e.target.value)}
                        rows={8}
                        placeholder="Contenido"
                        className="w-full"
                    />
                    <div className="flex justify-end mt-2">
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteItem(section.id)}
                        >
                            Eliminar contenido
                        </Button>
                    </div>
                </div>
            );
        }

        return (
            <div key={section.id} className="mb-4 pl-4 border-l-2">
                <div className="flex items-center gap-2 mb-2">
                    <Input
                        value={`${section.title}`}
                        onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                        placeholder={`${section.numbering}. Título`}
                        className="flex-1"
                    />
                    <div className="flex gap-2">
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
                    {" "}
                    {section.children.map((child) =>
                    {
                        if (child.type === "textBlock")
                        {
                            return renderSection(child);
                        }
                        return (
                            <div key={child.id} className="mb-2">
                                <Textarea
                                    value={child.text}
                                    onChange={(e) => updateContent(child.id, e.target.value)}
                                    rows={8}
                                    placeholder="Contenido"
                                    className="w-full"
                                />
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
    };

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
    );
}

function mapLocalToTarget(input: LocalContentSection): ContentSection
{
    if (input.type === "textBlock")
    {
        const returnValue: TextBlock = {
            $type: "textBlock",
            title: input.title,
            numbering: input.numbering,
            level: input.level,
            sections: input.children.map(mapLocalToTarget),
        };
        return returnValue;
    }
    else
    {
        const returnValue: TextArea = {
            $type: "textArea",
            content: input.text,
        };
        return returnValue;
    }
}
function mapTargetToLocal(input: ContentSection): LocalContentSection
{
    if (input.$type === "textBlock")
    {
        const returnValue: Section = {
            type: "textBlock",
            id: generateId(),
            title: input.title,
            numbering: input.numbering,
            level: input.level,
            children: input.sections.map(mapTargetToLocal),
        };
        return returnValue;
    }
    else
    {
        const returnValue: TextContent = {
            type: "textArea",
            id: generateId(),
            text: input.content,
            parentNumbering: "", // You need to provide this somehow, it's missing in target
        };
        return returnValue;
    }
}
