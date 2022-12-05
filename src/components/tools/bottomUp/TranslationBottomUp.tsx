import React, { SyntheticEvent } from 'react'
import { marked } from 'marked'
import { StyledTranslationBottomUp } from '../../styled/StyledTranslationButtomUp'
import { useStory } from '../../../context/StoryContext'
import { useWordData } from '../../../context/WordData'
import { MdxPartOfSpeech } from '../../../interfaces/Mdx'

interface ThirdPartyUrl {
    [x: string]: {
        name: string
        baseUrl: string
    }
}

const thirdPartyUrls: ThirdPartyUrl = {
    cambridge: {
        name: `Cambridge Dictionary`,
        baseUrl: `https://dictionary.cambridge.org/zht/詞典/英語-漢語-繁體/`
    },
    google: {
        name: `Google Translate`,
        baseUrl: `https://translate.google.com/?sl=en&tl=zh-TW&op=translate&text=`
    }
}

export const TranslatedFrom: React.FC = () => {
    const { story } = useStory()
    const word = useWordData.index(story.translationBottomUp.wordId || '')
    if (!word) return <></>
    const title = word.frontmatter?.title
    const thirdParty = word.frontmatter?.thirdParty
    let result = null
    let url = null
    if (typeof thirdPartyUrls[thirdParty] === undefined) return null
    result = thirdPartyUrls[thirdParty]
    url = `<a href="${result.baseUrl}${title}" target="_blank">${result.name}</a>`
    return (
        <div className={`translatedFrom`}>
            <strong>Translated from:</strong>
            <div
                dangerouslySetInnerHTML={{
                    __html: url
                }}
            ></div>
        </div>
    )
}

interface Props {
    locale: string
}

const TranslationBottomUp: React.FC<Props> = ({ locale }) => {
    const { story, storyDispatch } = useStory()
    const word = useWordData.index(story.translationBottomUp.wordId || '')
    const parseMarkdownInline = (index: number, type: string) => {
        if (!word) return
        const txt = word.frontmatter.partOfSpeech[index][type]
        return !txt ? txt : marked.parseInline(txt)
    }
    const handleBtnClose = () => {
        storyDispatch({
            type: 'translationBottomUp',
            payload: {
                display: false
            }
        })
    }
    const handleBtnRefer = (event: SyntheticEvent) => {
        const target = event.target as HTMLElement
        const refer = target.dataset.refer
        if (!refer) return
        const referWordId = useWordData.searchCache(refer)
        if (!referWordId) return
        storyDispatch({
            type: 'translationBottomUp',
            payload: {
                ...story.translationBottomUp,
                wordId: referWordId.toString(),
                display: true
            }
        })
    }
    if (!word) return <></>
    return (
        <StyledTranslationBottomUp
            className={`translationBottomUp rounded-top ${
                story.translationBottomUp.display ? 'show' : ''
            }`}
            data-word-id={story.translationBottomUp.wordId}
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
                                    {word.frontmatter?.refer && (
                                        <div className={`mb-2`}>
                                            <p className={`m-0`}>
                                                <strong>Learn:</strong>&nbsp;
                                                <a
                                                    className={`link-primary`}
                                                    onClick={handleBtnRefer}
                                                    data-refer={
                                                        word.frontmatter?.refer
                                                    }
                                                >
                                                    {word.frontmatter?.refer}
                                                </a>
                                            </p>
                                        </div>
                                    )}
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
