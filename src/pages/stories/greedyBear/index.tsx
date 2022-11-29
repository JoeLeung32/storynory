import React, { useState } from 'react'
import { HeadFC, PageProps } from 'gatsby'
import ScriptBuilder from '../../../components/scriptBuilder/ScriptBuilder'
import StoryBook from '../../../components/storyBook/StoryBook'

const jsonData = require('./story.json')

const StoryGreedyBear: React.FC<PageProps> = () => {
    const [audio, setAudio] = useState<HTMLAudioElement>()
    return (
        <StoryBook
            audioSourceUrl={jsonData.sound}
            handleAudio={setAudio}
            storyName={jsonData.storyName}
            captions={jsonData.captions}
            translationCode={`tc`}
        >
            <ScriptBuilder
                audio={audio}
                storyPath={`/stories/greedyBear/story.txt`}
                show={false}
            />
        </StoryBook>
    )
}

export default StoryGreedyBear

export const Head: HeadFC = () => <title>Stories</title>
