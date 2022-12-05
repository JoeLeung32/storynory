import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { Caption } from '../../interfaces/Caption'
import StoryBookParagraph from './StoryBookParagraph'
import { DOMStory } from '../../utils/DOM'
import { useStory } from '../../context/StoryContext'
import TranslationBottomUp from '../tools/bottomUp/TranslationBottomUp'

interface Props {
    audioSourceUrl: string
    handleAudio: any
    storyName: string
    captions: Caption[]
    locale: string
    children: React.ReactElement | undefined
}

const StoryBook: React.FC<Props> = (props) => {
    // Declare
    const { storyName, captions, children, locale } = props
    const { audioSourceUrl, handleAudio } = props
    const audioRef = useRef<HTMLAudioElement>(
        typeof window !== 'undefined' ? new Audio(audioSourceUrl) : null
    )
    const audio = audioRef.current
    const { story, storyDispatch } = useStory()
    // Functions
    const handleAudioOnTimeUpdate = () => {
        const doLooping = () => {
            const tl = story.audioTimeLoop
            if (!audio || !tl) return
            if (tl.start && tl.start >= audio.currentTime) {
                audio.currentTime = tl.start || 0
            } else if (tl.end && tl.end <= audio.currentTime) {
                audio.currentTime = tl.start || 0
            }
        }
        const doHighlightAndScroll = () => {
            if (!audio) return
            const ct = audio.currentTime
            if (!captions) return
            const paragraphs = captions.map((c) =>
                c.type === 'paragraph' ? c.data : null
            )
            const currentParagraphIndex = paragraphs
                .map((line, idx) =>
                    line && line?.length
                        ? line.map((l, lidx) =>
                              ct >= Number(l.start) && ct < Number(l.end)
                                  ? {
                                        id: `p${idx}l${lidx}`,
                                        content: l.content,
                                        start: l.start,
                                        end: l.end
                                    }
                                  : null
                          )
                        : null
                )
                .flatMap((p) => p)
                .filter((p) => p)
                .pop()
            if (!currentParagraphIndex) return
            storyDispatch({
                type: 'currentParagraphId',
                payload: currentParagraphIndex.id
            })
            DOMStory.autoScrollTo(currentParagraphIndex.id, story.highlighter)
        }
        doLooping()
        doHighlightAndScroll()
    }
    // Life Cycle
    const effects = {
        audioInitial: () => {
            if (!audio) return
            audio.addEventListener('timeupdate', handleAudioOnTimeUpdate)
            audio.load()
            handleAudio(audio)
            return () => {
                audio.removeEventListener('timeupdate', handleAudioOnTimeUpdate)
            }
        },
        audioEventListenerRefresh: () => {
            if (!audio) return
            audio.addEventListener('timeupdate', handleAudioOnTimeUpdate)
            return () => {
                audio.removeEventListener('timeupdate', handleAudioOnTimeUpdate)
            }
        }
    }
    useEffect(effects.audioInitial, [])
    useEffect(effects.audioEventListenerRefresh, [
        story.highlighter,
        story.audioTimeLoop
    ])
    // Output
    return (
        <main className={`container-fluid`}>
            <h1>{storyName}</h1>
            <StyledStoryContent className={`storyContent`}>
                {captions.map((caption: Caption, idx: number) => (
                    <React.Fragment key={idx}>
                        {caption.type === 'paragraph' && (
                            <StoryBookParagraph
                                id={`p${idx}`}
                                locale={locale}
                                audio={audio}
                                data={caption.data}
                            ></StoryBookParagraph>
                        )}
                    </React.Fragment>
                ))}
                <TranslationBottomUp locale={locale}></TranslationBottomUp>
            </StyledStoryContent>
            {children}
        </main>
    )
}

export default StoryBook

const StyledStoryContent = styled.div`
    position: relative;
`
