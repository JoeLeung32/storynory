import React, { createContext, useContext, useReducer } from 'react'
import { CaptionTimestamp } from '../interfaces/Caption'

type ActionType =
    | { type: 'clean'; payload: {} }
    | { type: 'audioPause'; payload: boolean }
    | { type: 'audioTimeLoop'; payload: CaptionTimestamp }
    | { type: 'highlighter'; payload: boolean }
    | { type: 'currentParagraphId'; payload: string }
    | {
          type: 'translation'
          payload: {
              wordId: string
              tooltip?: {
                  display?: boolean
                  posTop?: string
                  posLeft?: string
              }
              bottomUp?: {
                  display: boolean
              }
          }
      }

const initialState = {
    pause: false,
    timeLoop: {} as CaptionTimestamp,
    highlighter: true,
    currentParagraphId: '',
    translation: {
        wordId: '',
        tooltip: {
            display: false,
            posTop: '-100%',
            posLeft: '-100%'
        },
        bottomUp: {
            display: false
        }
    }
}

interface StoryInterface {
    story: typeof initialState
    storyDispatch: React.Dispatch<ActionType>
}

const StoryContext = createContext<StoryInterface>({
    story: initialState,
    storyDispatch: () => {}
})

const reducer = (state: typeof initialState, action: ActionType) => {
    switch (action.type) {
        case 'clean': {
            return {
                ...state,
                highlighter: true
            }
        }
        case 'audioPause': {
            return {
                ...state,
                pause: action.payload
            }
        }
        case 'audioTimeLoop': {
            return {
                ...state,
                timeLoop: action.payload
            }
        }
        case 'highlighter': {
            return {
                ...state,
                highlighter: action.payload
            }
        }
        case 'currentParagraphId': {
            return {
                ...state,
                currentParagraphId: action.payload
            }
        }
        case 'translation': {
            return {
                ...state,
                translation: action.payload
            }
        }
        default: {
            throw new Error()
        }
    }
}

interface Props {
    children: React.ReactElement | undefined
}

export const StoryProvider: React.FC<Props> = ({ children }) => {
    const [story, storyDispatch] = useReducer(reducer, initialState)
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
