import React, {
    createContext,
    useContext,
    useEffect,
    useReducer,
    useRef
} from 'react'
import { CaptionLine, CaptionTimestamp } from '../interfaces/Caption'

interface TranslationBottomUpInterface {
    wordId?: string | null
    display: boolean
}

type ActionType =
    | { type: 'clean'; payload: {} }
    | { type: 'audioPause'; payload: boolean }
    | { type: 'audioTimeLoop'; payload: CaptionTimestamp }
    | { type: 'highlighter'; payload: boolean }
    | { type: 'currentParagraphId'; payload: string }
    | {
          type: 'translationBottomUp'
          payload: TranslationBottomUpInterface
      }

const initialState = {
    callbackFire: false,
    audioPause: false,
    audioTimeLoop: {} as CaptionTimestamp,
    highlighter: true,
    currentParagraphId: '',
    currentParagraph: {
        content: '',
        start: null,
        end: null
    } as CaptionLine,
    translationBottomUp: {
        display: false
    } as TranslationBottomUpInterface
}

/*
type Callback = (story: typeof initialState) => void
type Dispatch<A, B> = (value: A, callback?: B) => void
*/

interface StoryInterface {
    story: typeof initialState
    // storyDispatch: Dispatch<ActionType, Callback>
    storyDispatch: React.Dispatch<ActionType>
}

const StoryContext = createContext<StoryInterface>({
    story: initialState,
    storyDispatch: () => {}
})

const reducer = (state: typeof initialState, action: ActionType) => {
    const { type: actionType, payload } = action
    switch (actionType) {
        case 'clean': {
            return {
                ...state,
                highlighter: true
            }
        }
        default: {
            return {
                ...state,
                [actionType]: payload
            }
        }
    }
}

interface Props {
    children: React.ReactElement | undefined
}

export const StoryProvider: React.FC<Props> = ({ children }) => {
    const callbackRef = useRef((story: typeof initialState) => {})
    const [story, storyDispatch] = useReducer(reducer, initialState)
    /*
    const customDispatch = (action: ActionType, callback?: Callback) => {
        if (typeof callback === 'function') callbackRef.current = callback
        storyDispatch(action)
    }
    */
    useEffect(() => {
        callbackRef.current && callbackRef.current(story)
    }, [story])

    return (
        <StoryContext.Provider
            value={{
                story,
                storyDispatch
            }}
        >
            {children}
        </StoryContext.Provider>
    )
}

export const useStory = () => useContext(StoryContext)
