import React, { SyntheticEvent, useEffect, useRef, useState } from 'react'
import { HeadFC } from 'gatsby'
import styled from 'styled-components'
import { CaptionLine, CaptionTimestamp } from '../../interfaces/Caption'

interface Props {
    audio: HTMLAudioElement | undefined
    storyPath: string | undefined
}

const timeLoopDefault = {
    start: null,
    end: null,
}

const ScriptBuilder: React.FC<Props> = ({ audio, storyPath }) => {
    const divRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const [script, setScript] = useState('')
    const [timeLoop, setTimeLoop] = useState<CaptionTimestamp>(timeLoopDefault)
    const [selectedScript, setSelectedScript] = useState<CaptionLine[]>([])
    const handleSelectedScript = (event: SyntheticEvent) => {
        const selectedText = window?.getSelection()?.toString().trim()
        const newData = {
            ...timeLoop,
            content: selectedText,
        } as CaptionLine
        setSelectedScript([...selectedScript, newData])
        if (textareaRef.current) {
            textareaRef.current.innerText = JSON.stringify([
                ...selectedScript,
                newData,
            ])
        }
    }
    const handleSelectedScriptClean = () => {
        setSelectedScript([])
        if (!textareaRef.current) return
        textareaRef.current.innerText = ''
    }
    const handleSetStart = () => {
        if (!audio) return
        setTimeLoop({
            start: audio.currentTime,
            end: timeLoop.end,
        })
    }
    const handleSetEnd = () => {
        if (!audio) return
        setTimeLoop({
            start: timeLoop.start,
            end: audio.currentTime,
        })
        audio?.pause()
    }
    useEffect(() => {
        if (!storyPath) return
        fetch(new Request(storyPath))
            .then((response) => response.text())
            .then((data) => {
                let content = data
                content = content.replace(/\r?\n/g, '<br/>')
                setScript(content)
            })
        return () => {}
    }, [])
    return (
        <>
            <hr />
            <div className={`card mb-3`}>
                <StyledScriptSource
                    ref={divRef}
                    dangerouslySetInnerHTML={{ __html: script }}
                ></StyledScriptSource>
            </div>
            <p>
                Start: {timeLoop.start} / End: {timeLoop.end}
            </p>
            <p>
                <StyledTextArea
                    ref={textareaRef}
                    className={`form-control`}
                ></StyledTextArea>
            </p>
            <div className={`btn-group mb-5`}>
                <button
                    className={`btn btn-sm btn-primary`}
                    onClick={handleSetStart}
                >
                    Capture Start Time
                </button>
                <button
                    className={`btn btn-sm btn-primary`}
                    onClick={handleSetEnd}
                >
                    Capture End Time
                </button>
                <button
                    className={`btn btn-sm btn-primary`}
                    onClick={handleSelectedScript}
                >
                    Use Selected Script
                </button>
                <button
                    className={`btn btn-sm btn-primary`}
                    onClick={() => audio?.play()}
                >
                    Play
                </button>
                <button
                    className={`btn btn-sm btn-primary`}
                    onClick={() => audio?.pause()}
                >
                    Pause
                </button>
                <button
                    className={`btn btn-sm btn-primary`}
                    onClick={handleSelectedScriptClean}
                >
                    Clean
                </button>
            </div>
        </>
    )
}

const StyledTextArea = styled.textarea`
    height: 10rem;
`

const StyledScriptSource = styled.div`
    overflow: hidden;
    overflow-y: auto;
    width: 100%;
    height: 10rem;
`

export default ScriptBuilder

export const Head: HeadFC = () => <title>Script Builder</title>
