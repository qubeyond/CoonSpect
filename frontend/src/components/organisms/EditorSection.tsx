import React, { useState, useEffect, useRef } from "react";
import { useTextStore } from "../../stores";
import EditorToolbar from "../molecules/EditorToolbar";
import Heading from "../atoms/Heading";
import Button from "../atoms/Button";
import Icon from "../atoms/Icon";
import Text from "../atoms/Text";

interface EditorSectionProps {
    initialText: string;
    onSave: (newText: string) => void;
    onBack?: () => void;
}

const EditorSection: React.FC<EditorSectionProps> = ({ initialText, onSave, onBack }) => {
    const { processedText, setProcessedText, audioUrl, audioFile } = useTextStore();
    const [text, setText] = useState(processedText || initialText);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        setText(processedText || initialText);
    }, [processedText, initialText]);

    const handleTextChange = (newText: string) => {
        setText(newText);
        setProcessedText(newText);
    };

    const handleSave = () => {
        setProcessedText(text);
        onSave(text);
    };

    const handleCopy = () => {
        if (!navigator.clipboard) {
            if (textareaRef.current) {
                textareaRef.current.select();
                document.execCommand('copy');
                textareaRef.current.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length);
            }
        } else {
            navigator.clipboard.writeText(text).catch(() => {
                if (textareaRef.current) {
                    textareaRef.current.select();
                    document.execCommand('copy');
                    textareaRef.current.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length);
                }
            });
        }
    };

    const getCurrentLineInfo = (position: number) => {
        const textBeforeCursor = text.substring(0, position);
        const textAfterCursor = text.substring(position);
        const linesBefore = textBeforeCursor.split('\n');
        const linesAfter = textAfterCursor.split('\n');
        
        const currentLineIndex = linesBefore.length - 1;
        const currentLine = linesBefore[currentLineIndex] + linesAfter[0];
        const lineStartPosition = position - linesBefore[currentLineIndex].length;
        const lineEndPosition = lineStartPosition + currentLine.length;
        
        return {
            currentLine,
            currentLineIndex,
            lineStartPosition,
            lineEndPosition
        };
    };

    const handleFormat = (type: 'bold' | 'italic' | 'list' | 'heading' | 'quote' | 'link') => {
        if (!textareaRef.current) return;

        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = text.substring(start, end);

        let newText = '';
        let newCursorPos = start;

        switch (type) {
            case 'bold':
                const boldBefore = text.substring(start - 2, start) === '**';
                const boldAfter = text.substring(end, end + 2) === '**';
                
                if (boldBefore && boldAfter) {
                    newText = text.substring(0, start - 2) + selectedText + text.substring(end + 2);
                    newCursorPos = start - 2;
                } else {
                    newText = text.substring(0, start) + `**${selectedText}**` + text.substring(end);
                    newCursorPos = start + 2;
                }
                handleTextChange(newText);
                break;
                
            case 'italic':
                const italicBefore = text.substring(start - 1, start) === '*';
                const italicAfter = text.substring(end, end + 1) === '*';
                
                if (italicBefore && italicAfter) {
                    newText = text.substring(0, start - 1) + selectedText + text.substring(end + 1);
                    newCursorPos = start - 1;
                } else {
                    newText = text.substring(0, start) + `*${selectedText}*` + text.substring(end);
                    newCursorPos = start + 1;
                }
                handleTextChange(newText);
                break;
                
            case 'list':
                const lineInfo = getCurrentLineInfo(start);
                const currentLine = lineInfo.currentLine;
                
                if (currentLine.startsWith('- ')) {
                    const newLine = currentLine.substring(2);
                    newText = 
                        text.substring(0, lineInfo.lineStartPosition) + 
                        newLine + 
                        text.substring(lineInfo.lineEndPosition);
                    newCursorPos = lineInfo.lineStartPosition + newLine.length;
                } else {
                    const newLine = `- ${currentLine}`;
                    newText = 
                        text.substring(0, lineInfo.lineStartPosition) + 
                        newLine + 
                        text.substring(lineInfo.lineEndPosition);
                    newCursorPos = lineInfo.lineStartPosition + newLine.length;
                }
                handleTextChange(newText);
                break;
                
            case 'heading':
                const headingLineInfo = getCurrentLineInfo(start);
                const headingCurrentLine = headingLineInfo.currentLine;
                
                if (headingCurrentLine.startsWith('## ')) {
                    const newLine = headingCurrentLine.substring(3);
                    newText = 
                        text.substring(0, headingLineInfo.lineStartPosition) + 
                        newLine + 
                        text.substring(headingLineInfo.lineEndPosition);
                    newCursorPos = headingLineInfo.lineStartPosition + newLine.length;
                } else {
                    const newLine = `## ${headingCurrentLine}`;
                    newText = 
                        text.substring(0, headingLineInfo.lineStartPosition) + 
                        newLine + 
                        text.substring(headingLineInfo.lineEndPosition);
                    newCursorPos = headingLineInfo.lineStartPosition + newLine.length;
                }
                handleTextChange(newText);
                break;
                
            case 'quote':
                const quoteLineInfo = getCurrentLineInfo(start);
                const quoteCurrentLine = quoteLineInfo.currentLine;
                
                if (quoteCurrentLine.startsWith('> ')) {
                    const newLine = quoteCurrentLine.substring(2);
                    newText = 
                        text.substring(0, quoteLineInfo.lineStartPosition) + 
                        newLine + 
                        text.substring(quoteLineInfo.lineEndPosition);
                    newCursorPos = quoteLineInfo.lineStartPosition + newLine.length;
                } else {
                    const newLine = `> ${quoteCurrentLine}`;
                    newText = 
                        text.substring(0, quoteLineInfo.lineStartPosition) + 
                        newLine + 
                        text.substring(quoteLineInfo.lineEndPosition);
                    newCursorPos = quoteLineInfo.lineStartPosition + newLine.length;
                }
                handleTextChange(newText);
                break;
                
            case 'link':
                if (selectedText) {
                    const linkRegex = /^\[(.*)\]\((.*)\)$/;
                    const match = selectedText.match(linkRegex);
                    
                    if (match) {
                        const linkText = match[1];
                        newText = text.substring(0, start) + linkText + text.substring(end);
                        newCursorPos = start + linkText.length;
                    } else {
                        const formattedText = `[${selectedText}](https://)`;
                        newText = text.substring(0, start) + formattedText + text.substring(end);
                        newCursorPos = start + 1 + selectedText.length + 2;
                    }
                } else {
                    const formattedText = '[текст ссылки](https://)';
                    newText = text.substring(0, start) + formattedText + text.substring(end);
                    newCursorPos = start + 13;
                }
                handleTextChange(newText);
                break;
        }

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    const renderPreview = () => {
        if (!text.trim()) {
            return (
                <div className="flex items-center justify-center h-full text-[var(--color-text-secondary)]">
                    <Text size="lg">Здесь будет предпросмотр вашего конспекта</Text>
                </div>
            );
        }

        const formattedText = text
            .split('\n')
            .map(line => {
                if (line.startsWith('## ')) {
                    return `<h3 class="text-xl font-bold mt-4 mb-2 text-[var(--color-text-primary)]">${line.slice(3)}</h3>`;
                }
                else if (line.startsWith('> ')) {
                    return `<blockquote class="border-l-4 border-[var(--color-text-purple)] pl-4 my-2 text-[var(--color-text-secondary)] italic">${line.slice(2)}</blockquote>`;
                }
                else if (line.startsWith('- ')) {
                    return `<li class="ml-4 text-[var(--color-text-primary)] mb-1">${line.slice(2)}</li>`;
                }
                else if (line.trim() === '') {
                    return '<br>';
                }
                else {
                  let processedLine = line
                        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-[var(--color-text-primary)]">$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em class="italic text-[var(--color-text-secondary)]">$1</em>')
                        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-[var(--color-text-purple)] hover:opacity-80 underline" target="_blank">$1</a>');
                  
                  return `<p class="mb-3 text-[var(--color-text-primary)] leading-relaxed">${processedLine}</p>`;
                }
            })
            .join('');

        return (
            <div 
                className="h-full"
                dangerouslySetInnerHTML={{ __html: formattedText }}
            />
        );
    };

    return (
        <section className="min-h-screen py-20 px-6 bg-[var(--color-bg-primary)]">
            <div className="w-full max-w-5xl mx-auto">
                
                {/* Заголовок - на отдельной строке сверху */}
                <div className="mb-6 text-center">
                    <Heading level={1} className="font-bold text-[var(--color-text-purple)] text-2xl sm:text-3xl">
                        Отредактируй и скачай конспект
                    </Heading>
                </div>
                
                {/* Кнопка Назад - на строке ниже */}
                <div className="mb-8">
                    {onBack && (
                        <Button
                            onClick={onBack}
                            variant="secondary"
                            className="flex items-center gap-2"
                        >
                            <Icon name="ArrowLeft" className="w-4 h-4" />
                            Назад
                        </Button>
                    )}
                </div>

                <div className="mb-8">
                    <EditorToolbar 
                        onFormat={handleFormat}
                        onSave={handleSave}
                        onCopy={handleCopy}
                    />
                </div>

                {/* Редактор и предпросмотр */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Редактор */}
                    <div className="flex flex-col">
                        <Heading level={3} className="text-[var(--color-text-secondary)] mb-3 text-base font-medium">
                            Редактор
                        </Heading>
                        <div className="h-[450px] bg-[var(--color-bg-accent)] rounded-lg border border-[var(--color-border)] overflow-hidden">
                            <textarea
                                ref={textareaRef}
                                value={text}
                                onChange={(e) => handleTextChange(e.target.value)}
                                className="w-full h-full bg-transparent text-[var(--color-text-primary)] p-5 outline-none resize-none text-sm leading-relaxed font-mono"
                                placeholder="Введите текст здесь..."
                                style={{
                                    minHeight: '100%',
                                    height: '100%'
                                }}
                            />
                        </div>
                    </div>

                    {/* Предпросмотр */}
                    <div className="flex flex-col">
                        <Heading level={3} className="text-[var(--color-text-secondary)] mb-3 text-base font-medium">
                            Предпросмотр
                        </Heading>
                        <div className="h-[450px] bg-[var(--color-bg-accent)] rounded-lg border border-[var(--color-border)] p-5 overflow-y-auto">
                            {renderPreview()}
                        </div>
                    </div>    
                </div>    

                {audioUrl && (
                    <div className="mt-8 max-w-md mx-auto">
                        <Heading level={3} className="text-[var(--color-text-purple)] mb-3 text-base">
                            {audioFile ? `  ${audioFile.name}` : ''}
                        </Heading>
                        <audio
                            controls
                            src={audioUrl}
                            className="w-full rounded-lg"
                        >
                            Ваш браузер не поддерживает воспроизведение аудио.
                        </audio>
                    </div>
                )}

            </div>
        </section>
    );
};

export default EditorSection;