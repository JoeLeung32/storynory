import React, { useEffect } from 'react'
import { marked } from 'marked'
import { StyledTranslationTooltip } from '../../styled/StyledTranslationTooltip'
import { useStory } from '../../../context/StoryContext'
import { useWordData } from '../../../context/WordData'

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

interface PropsForTranslationTooltip {
    locale: string
}

export const TranslatedFrom: React.FC = () => {
    const { story } = useStory()
    const word = useWordData.index(story.translation.wordId)
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

const TranslationTooltip: React.FC<PropsForTranslationTooltip> = ({
    locale
}) => {
    const { story, storyDispatch } = useStory()
    const word = useWordData.index(story.translation.wordId)
    const parseMarkdownInline = (type: string) => {
        if (!word) return
        const txt = word.frontmatter.partOfSpeech[0][type]
        return !txt ? txt : marked.parseInline(txt)
    }
    const handleBtnClose = () => {
        storyDispatch({
            type: 'translation',
            payload: {
                ...story.translation,
                wordId: '',
                tooltip: {
                    display: false
                }
            }
        })
    }
    const handleBtnDetail = () => {
        storyDispatch({
            type: 'translation',
            payload: {
                ...story.translation,
                tooltip: {
                    display: false
                },
                bottomUp: {
                    display: true
                }
            }
        })
    }
    useEffect(() => {
        if (!story.translation.wordId.length) return
        if (!story.translation.tooltip.display) return
        const storyContent = document.querySelector(
            '.storyContent'
        ) as HTMLElement
        const target = document.querySelector(
            `.storyContent .translationTag[data-word-idx="${story.translation.wordId}"]`
        ) as HTMLElement
        const translationTooltip = document.querySelector(
            '.storyContent .translationTooltip'
        ) as HTMLElement
        const offsetTop = storyContent.getBoundingClientRect().top
        const offsetLeft = storyContent.getBoundingClientRect().left
        const elementWidth = target.getBoundingClientRect().width
        const elementHeight = target.getBoundingClientRect().height
        let translationToolTipLeft = 0
        let translationToolTipTop = 0

        // Position Left
        translationToolTipLeft =
            target.getBoundingClientRect().x -
            offsetLeft -
            translationTooltip.offsetWidth / 2 +
            elementWidth / 2
        if (translationToolTipLeft < 0) translationToolTipLeft = 0
        if (
            translationToolTipLeft + translationTooltip.offsetWidth >=
            window.innerWidth
        ) {
            translationToolTipLeft =
                window.innerWidth - translationTooltip.offsetWidth
        }

        // Position Top
        translationToolTipTop =
            target.getBoundingClientRect().y -
            offsetTop -
            elementHeight / 2 -
            translationTooltip.offsetHeight
        if (translationToolTipTop < 0) translationToolTipTop = 0

        storyDispatch({
            type: 'translation',
            payload: {
                ...story.translation,
                wordId: story.translation.wordId,
                tooltip: {
                    ...story.translation.tooltip,
                    posLeft: `${translationToolTipLeft}px`,
                    posTop: `${translationToolTipTop}px`
                }
            }
        })
        return () => {
            storyDispatch({
                type: 'translation',
                payload: {
                    ...story.translation,
                    wordId: story.translation.wordId,
                    tooltip: {
                        display: false,
                        posLeft: `-100%`,
                        posTop: `-100%`
                    }
                }
            })
        }
    }, [word])
    useEffect(() => {
        if (!story.translation.tooltip.display) return
        if (!story.translation.tooltip.posTop) return
        const translationTooltip = document.querySelector(
            '.storyContent .translationTooltip'
        ) as HTMLElement
        if (!translationTooltip) return
        translationTooltip.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
        })
        return () => {}
    }, [story.translation.tooltip.display, story.translation.tooltip.posTop])

    if (!word) return <></>
    return (
        <StyledTranslationTooltip
            className={`translationTooltip rounded`}
            data-word-id={story.translation.wordId}
            style={{
                opacity: story.translation.tooltip.display ? '1' : '0',
                left: story.translation.tooltip.posLeft,
                top: story.translation.tooltip.posTop
            }}
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
                    <p className="badge bg-primary m-0 my-1">
                        {word.frontmatter?.partOfSpeech[0].type}
                    </p>
                    <p className={`m-0 fw-bold`}>{parseMarkdownInline('en')}</p>
                    <p className={`m-0`}>{parseMarkdownInline(locale)}</p>
                </div>
                {word.frontmatter?.refer && (
                    <div className={`mb-2`}>
                        <p className={`m-0`}>
                            <strong>Learn:</strong>&nbsp;
                            <a className={`link-primary`} onClick={() => {}}>
                                {word.frontmatter?.refer}
                            </a>
                        </p>
                    </div>
                )}
                <div className={`mb-2`}>
                    <button
                        className={`btn btn-sm btn-info`}
                        onClick={handleBtnDetail}
                    >
                        Show More
                    </button>
                </div>
                <TranslatedFrom />
            </div>
        </StyledTranslationTooltip>
    )
}

export default TranslationTooltip
