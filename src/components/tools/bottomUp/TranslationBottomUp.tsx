import React, { SyntheticEvent, useEffect, useRef } from 'react'
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
    },
    liushengyingyu: {
        name: `留聲詞典`,
        baseUrl: `https://dictionary.liushengyingyu.com/zh-hant/ec/`
    },
    chinesewords: {
        name: `漢語網`,
        baseUrl: `https://www.chinesewords.org/en/`
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
    const divRef = useRef() as React.MutableRefObject<HTMLDivElement>
    const parseMarkdownInline = (text: string) =>
        !text ? text : marked.parseInline(text)
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
    useEffect(() => {
        if (!story.translationBottomUp.display) return
        if (!divRef.current) return
        divRef.current.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        })
        return () => {}
    }, [story.translationBottomUp])

    if (!word) return <></>
    return (
        <StyledTranslationBottomUp
            ref={divRef}
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
                                    {data.type.split(',').map((type, tIdx) => (
                                        <p
                                            key={tIdx}
                                            className="badge bg-primary m-0 my-1 me-1"
                                        >
                                            {type}
                                        </p>
                                    ))}
                                    <p className={`m-0 fw-bold`}>
                                        {parseMarkdownInline(
                                            word.frontmatter.partOfSpeech[
                                                Number(idx)
                                            ]['en']
                                        )}
                                    </p>
                                    <p className={`m-0`}>
                                        {parseMarkdownInline(
                                            word.frontmatter.partOfSpeech[
                                                Number(idx)
                                            ][locale]
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
                                    <hr className={`my-4`} />
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
