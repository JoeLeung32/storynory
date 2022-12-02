import React from 'react'
import { marked } from 'marked'
import { TranslationContent } from '../../../interfaces/Translation'
import { StyledTranslationBottomUp } from '../../styled/StyledTranslationButtomUp'
import { TranslatedFrom } from '../tooltips/TranslationTooltip'
import { DOMTranslationBottomUp } from '../../../utils/DOM'

interface Props {
    translationCode: string
    translationObject?: TranslationContent
}

const TranslationBottomUp: React.FC<Props> = (props) => {
    const { translationCode, translationObject } = props
    const parseMarkdownInline = (type: string) =>
        translationObject &&
        marked.parseInline(translationObject.partOfSpeech[0][type])

    return (
        <StyledTranslationBottomUp
            className={`translationBottomUp rounded-top`}
            data-word-id={translationObject?.wordId}
        >
            <header className={`d-flex justify-content-between`}>
                <div>Dictionary</div>
                <div
                    className={`btnClose`}
                    onClick={DOMTranslationBottomUp.hide}
                >
                    <i className="fa-solid fa-xmark"></i>
                </div>
            </header>
            <div className={`p-2`}>
                <div className={`mb-2 content`}>
                    <p className="m-0 fw-bold text-capitalize">
                        {translationObject?.word}
                    </p>
                    {translationObject?.partOfSpeech.map((data, idx) => {
                        return (
                            <React.Fragment key={idx}>
                                <p className="badge bg-primary m-0 my-1">
                                    {data.type}
                                </p>
                                <p className={`m-0 fw-bold`}>
                                    {parseMarkdownInline('en')}
                                </p>
                                <p className={`m-0`}>
                                    {parseMarkdownInline(translationCode)}
                                </p>
                                <ul className={`mt-2`}>
                                    {data.examples.map((li, liIdx: number) => (
                                        <li key={liIdx}>
                                            <i>{li.en}</i>
                                            <br />
                                            {li[translationCode]}
                                        </li>
                                    ))}
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
                                                    <li key={liIdx}>{li}</li>
                                                )
                                            )}
                                        </ul>
                                    </div>
                                )}
                            </React.Fragment>
                        )
                    })}
                </div>
                <TranslatedFrom
                    translationObject={translationObject}
                ></TranslatedFrom>
            </div>
        </StyledTranslationBottomUp>
    )
}

export default TranslationBottomUp
