import React, { SyntheticEvent, useEffect, useRef, useState } from 'react'
import { HeadFC } from 'gatsby'
import styled from 'styled-components'

interface Props {
    audio: HTMLAudioElement | undefined
    storyPath: string | undefined
}

interface LoopRange {
    start: number | null
    end: number | null
}

const loopRangeDefault = {
    start: null,
    end: null,
}

const StyleTextArea = styled.textarea`
    width: 100%;
    height: 3rem;
`

const ScriptBuilder: React.FC<Props> = ({ audio, storyPath }) => {
    const divRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const [script, setScript] = useState('')
    const [timestamp, setTimestamp] = useState<LoopRange>(loopRangeDefault)
    const [selectedScript, setSelectedScript] = useState([])
    const handleSelectedScript = (event: SyntheticEvent) => {
        const selectedText = window?.getSelection()?.toString().trim()
        const newData = {
            ...timestamp,
            content: selectedText,
        }
        // @ts-ignore
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
        if (textareaRef.current) {
            textareaRef.current.innerText = ''
        }
    }
    const handleSetStart = () => {
        if (audio) {
            setTimestamp({
                start: audio.currentTime,
                end: timestamp.end,
            })
        }
    }
    const handleSetEnd = () => {
        if (audio) {
            setTimestamp({
                start: timestamp.start,
                end: audio.currentTime,
            })
            audio?.pause()
        }
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
            <div>
                <StyleTextArea ref={textareaRef}></StyleTextArea>
            </div>
            <div className="btn-group" role="group" aria-label="Basic example">
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
            <div>
                Start: {timestamp.start} / End: {timestamp.end}
            </div>
            <hr />
            <div
                ref={divRef}
                dangerouslySetInnerHTML={{ __html: script }}
            ></div>
        </>
    )
}

export default ScriptBuilder

export const Head: HeadFC = () => <title>Script Builder</title>
