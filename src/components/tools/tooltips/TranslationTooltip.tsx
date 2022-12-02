import React, { useEffect } from 'react'
import { marked } from 'marked'
import { TranslationContent } from '../../../interfaces/Translation'
import { StyledTranslationTooltip } from '../../styled/StyledTranslationTooltip'
import {
    DOMTranslationBottomUp,
    DOMTranslationToolTip
} from '../../../utils/DOM'

interface PropsForTranslatedFrom {
    translationObject?: TranslationContent
}

interface PropsForTranslationTooltip extends PropsForTranslatedFrom {
    translationCode: string
}

export const TranslatedFrom: React.FC<PropsForTranslatedFrom> = (props) => {
    const { translationObject } = props
    return (
        <div className={`translatedFrom`}>
            <strong>Translated from:</strong>
            <div
                dangerouslySetInnerHTML={{
                    __html: translationObject?.thirdPartyUrls || ''
                }}
            ></div>
        </div>
    )
}

const TranslationTooltip: React.FC<PropsForTranslationTooltip> = (props) => {
    const { translationCode, translationObject } = props
    const parseMarkdownInline = (type: string) =>
        translationObject &&
        marked.parseInline(translationObject.partOfSpeech[0][type])
    useEffect(() => {
        if (!translationObject || !translationObject.target) return
        const { target } = translationObject
        const storyContent = document.querySelector(
            '.storyContent'
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
        translationTooltip.style.left = `${translationToolTipLeft}px`

        // Position Top
        translationToolTipTop =
            target.getBoundingClientRect().y -
            offsetTop -
            elementHeight / 2 -
            translationTooltip.offsetHeight
        if (translationToolTipTop < 0) translationToolTipTop = 0
        translationTooltip.style.top = `${translationToolTipTop}px`

        translationTooltip.classList.add('show')
        translationTooltip.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
        })
        return () => {
            translationTooltip.classList.remove('show')
            translationTooltip.style.left = '-100%'
            translationTooltip.style.top = '-100%'
        }
    }, [translationObject])

    return (
        <StyledTranslationTooltip
            className={`translationTooltip rounded`}
            data-word-id={translationObject?.wordId}
        >
            <header className={`d-flex justify-content-between`}>
                <div>Dictionary</div>
                <div
                    className={`btnClose`}
                    onClick={DOMTranslationToolTip.hide}
                >
                    <i className="fa-solid fa-xmark"></i>
                </div>
            </header>
            <div className={`p-2`}>
                <div className={`mb-2 content`}>
                    <p className="m-0 fw-bold text-capitalize">
                        {translationObject?.word}
                    </p>
                    <p className="badge bg-primary m-0 my-1">
                        {translationObject?.partOfSpeech[0].type}
                    </p>
                    <p className={`m-0 fw-bold`}>{parseMarkdownInline('en')}</p>
                    <p className={`m-0`}>
                        {parseMarkdownInline(translationCode)}
                    </p>
                </div>
                <div className={`mb-2`}>
                    <button
                        className={`btn btn-sm btn-info`}
                        onClick={(ev) => DOMTranslationBottomUp.show(ev)}
                    >
                        Show More
                    </button>
                </div>
                <TranslatedFrom translationObject={translationObject} />
            </div>
        </StyledTranslationTooltip>
    )
}

export default TranslationTooltip
