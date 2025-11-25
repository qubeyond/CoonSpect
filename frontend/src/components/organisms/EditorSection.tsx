// components/organisms/EditorSection.tsx
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
            // fallback for unsupported browsers
            if (textareaRef.current) {
                textareaRef.current.select();
                document.execCommand('copy');
                textareaRef.current.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length);
            }
        } else {
            navigator.clipboard.writeText(text).catch(() => {
                // fallback if writeText fails
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
                // Проверяем, есть ли уже форматирование вокруг выделенного текста
                const boldBefore = text.substring(start - 2, start) === '**';
                const boldAfter = text.substring(end, end + 2) === '**';
                
                if (boldBefore && boldAfter) {
                    // Удаляем форматирование
                    newText = text.substring(0, start - 2) + selectedText + text.substring(end + 2);
                    newCursorPos = start - 2;
                } else {
                    // Добавляем форматирование
                    newText = text.substring(0, start) + `**${selectedText}**` + text.substring(end);
                    newCursorPos = start + 2;
                }
                handleTextChange(newText);
                break;
                
            case 'italic':
                // Проверяем, есть ли уже форматирование вокруг выделенного текста
                const italicBefore = text.substring(start - 1, start) === '*';
                const italicAfter = text.substring(end, end + 1) === '*';
                
                if (italicBefore && italicAfter) {
                    // Удаляем форматирование
                    newText = text.substring(0, start - 1) + selectedText + text.substring(end + 1);
                    newCursorPos = start - 1;
                } else {
                    // Добавляем форматирование
                    newText = text.substring(0, start) + `*${selectedText}*` + text.substring(end);
                    newCursorPos = start + 1;
                }
                handleTextChange(newText);
                break;
                
            case 'list':
                const lineInfo = getCurrentLineInfo(start);
                const currentLine = lineInfo.currentLine;
                
                if (currentLine.startsWith('- ')) {
                    // Удаляем форматирование списка
                    const newLine = currentLine.substring(2);
                    newText = 
                        text.substring(0, lineInfo.lineStartPosition) + 
                        newLine + 
                        text.substring(lineInfo.lineEndPosition);
                    newCursorPos = lineInfo.lineStartPosition + newLine.length;
                } else {
                    // Добавляем форматирование списка
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
                    // Удаляем форматирование заголовка
                    const newLine = headingCurrentLine.substring(3);
                    newText = 
                        text.substring(0, headingLineInfo.lineStartPosition) + 
                        newLine + 
                        text.substring(headingLineInfo.lineEndPosition);
                    newCursorPos = headingLineInfo.lineStartPosition + newLine.length;
                } else {
                    // Добавляем форматирование заголовка
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
                    // Удаляем форматирование цитаты
                    const newLine = quoteCurrentLine.substring(2);
                    newText = 
                        text.substring(0, quoteLineInfo.lineStartPosition) + 
                        newLine + 
                        text.substring(quoteLineInfo.lineEndPosition);
                    newCursorPos = quoteLineInfo.lineStartPosition + newLine.length;
                } else {
                    // Добавляем форматирование цитаты
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
                    // Проверяем, является ли уже ссылкой
                    const linkRegex = /^\[(.*)\]\((.*)\)$/;
                    const match = selectedText.match(linkRegex);
                    
                    if (match) {
                        // Удаляем форматирование ссылки
                        const linkText = match[1];
                        newText = text.substring(0, start) + linkText + text.substring(end);
                        newCursorPos = start + linkText.length;
                    } else {
                        // Добавляем форматирование ссылки
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
                <div className="flex items-center justify-center h-full text-gray-500">
                    <Text size="lg">Здесь будет предпросмотр вашего конспекта</Text>
                </div>
            );
        }

        // Улучшенный парсер Markdown
        const formattedText = text
            // Блоковые элементы (обрабатываем построчно)
            .split('\n')
            .map(line => {
                // Заголовки
                if (line.startsWith('## ')) {
                    return `<h3 class="text-xl font-bold mt-4 mb-2 text-white">${line.slice(3)}</h3>`;
                }
                // Цитаты
                else if (line.startsWith('> ')) {
                    return `<blockquote class="border-l-4 border-purple-500 pl-4 my-2 text-gray-300 italic">${line.slice(2)}</blockquote>`;
                }
                // Списки
                else if (line.startsWith('- ')) {
                    return `<li class="ml-4 text-white">${line.slice(2)}</li>`;
                }
                // Пустые строки
                else if (line.trim() === '') {
                    return '<br>';
                }
                // Обычный текст
                else {
                    // Обрабатываем строчные элементы внутри строки
                  let processedLine = line
                        // Жирный текст
                        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
                        // Курсив
                        .replace(/\*(.*?)\*/g, '<em class="italic text-gray-300">$1</em>')
                        // Ссылки
                        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-purple-400 hover:text-purple-300 underline" target="_blank">$1</a>');
                  
                  return `<p class="mb-2 text-white">${processedLine}</p>`;
                }
            })
            .join('');

        return (
            <div 
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: formattedText }}
            />
        );
    };

    return (
        <section className="min-h-screen py-20 px-6">
            <div className="w-full max-w-4xl mx-auto">
                
                <div className="flex items-center justify-center gap-6 mb-4">
                    <Heading level={1} className="font-bold text-purple-400">
                        Отредактируй и скачай конспект
                    </Heading>
                </div>
                
                <div className="flex items-center gap-4 mb-8">
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

                <EditorToolbar 
                    onFormat={handleFormat}
                    onSave={handleSave}
                    onCopy={handleCopy}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="flex flex-col">
                        <Heading level={3} className="text-gray-400 mb-4">
                            Редактор
                        </Heading>
                        <div className="flex-1">
                            <textarea
                                ref={textareaRef}
                                value={text}
                                onChange={(e) => handleTextChange(e.target.value)}
                                className="w-full h-[480px] bg-[#16182D] text-white rounded-xl p-6 outline-none focus:ring-2 focus:ring-purple-500 resize-none text-lg leading-relaxed font-mono"
                                placeholder="Введите текст здесь..."
                            />
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <Heading level={3} className="text-gray-400 mb-4">
                            Предпросмотр
                        </Heading>
                        <div className="flex-1 bg-[#16182D] rounded-xl p-6 h-[480px] overflow-auto">
                            {renderPreview()}
                        </div>
                    </div>    
                </div>    

                {audioUrl && (
                    <div className="mt-8 w-full max-w-4xl mx-auto">
                        <Heading level={3} className="text-purple-400 mb-4">
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
