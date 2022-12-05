import React from 'react'
import { marked } from 'marked'
import { StyledTranslationBottomUp } from '../../styled/StyledTranslationButtomUp'
import { TranslatedFrom } from '../tooltips/TranslationTooltip'
import { useStory } from '../../../context/StoryContext'
import { useWordData } from '../../../context/WordData'
import { MdxPartOfSpeech } from '../../../interfaces/Mdx'

interface Props {
    locale: string
}

const TranslationBottomUp: React.FC<Props> = ({ locale }) => {
    const { story, storyDispatch } = useStory()
    const word = useWordData.index(story.translation.wordId)
    const parseMarkdownInline = (index: number, type: string) => {
        if (!word) return
        const txt = word.frontmatter.partOfSpeech[index][type]
        return !txt ? txt : marked.parseInline(txt)
    }
    const handleBtnClose = () => {
        storyDispatch({
            type: 'translation',
            payload: {
                ...story.translation,
                wordId: '',
                bottomUp: {
                    display: false
                }
            }
        })
    }
    console.log('~>', story.translation)
    if (!word) return <></>
    return (
        <StyledTranslationBottomUp
            className={`translationBottomUp rounded-top ${
                story.translation.bottomUp.display ? 'show' : ''
            }`}
            data-word-id={story.translation.wordId}
        >
            <header className={`d-flex justify-content-between`}>
                <div>Dictionary</div>
                <div className={`btnClose`} onClick={handleBtnClose}>
                    <i className="fa-solid fa-xmark"></i>
                </div>
            </header>
            <div className={`p-2`}>
                <div className={`mb-2 content`}>
                    <p className="m-0 fw-bold text-capitalize">
                        {word.frontmatter?.title}
                    </p>
                    {word.frontmatter?.partOfSpeech.map(
                        (
                            data: MdxPartOfSpeech,
                            idx: React.Key | null | undefined
                        ) => {
                            return (
                                <React.Fragment key={idx}>
                                    <p className="badge bg-primary m-0 my-1">
                                        {data.type}
                                    </p>
                                    <p className={`m-0 fw-bold`}>
                                        {parseMarkdownInline(Number(idx), 'en')}
                                    </p>
                                    <p className={`m-0`}>
                                        {parseMarkdownInline(
                                            Number(idx),
                                            locale
                                        )}
                                    </p>
                                    <ul className={`mt-2`}>
                                        {data.examples &&
                                            data.examples.map(
                                                (li, liIdx: number) => (
                                                    <li key={liIdx}>
                                                        <i>{li.en}</i>
                                                        <br />
                                                        {li[locale]}
                                                    </li>
                                                )
                                            )}
                                    </ul>
                                    {data.moreExamples && (
                                        <div
                                            className={`bg-light rounded shadow-sm mt-2 p-2`}
                                        >
                                            <p className={`m-0 fw-bold`}>
                                                More Examples
                                            </p>
                                            <ul className={`m-0`}>
                                                {data.moreExamples.map(
                                                    (li, liIdx: number) => (
                                                        <li key={liIdx}>
                                                            {li}
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        </div>
                                    )}
                                </React.Fragment>
                            )
                        }
                    )}
                </div>
                <TranslatedFrom />
            </div>
        </StyledTranslationBottomUp>
    )
}

export default TranslationBottomUp
