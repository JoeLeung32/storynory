import React from "react"
import {HeadFC, PageProps} from "gatsby"

const StoriesIndexPage: React.FC<PageProps> = () => {
	return (
		<main>
			<h1>Stories</h1>
			<ul>
				<li>
					<a href={`./greedyBear`}>
						The Greedy Bear
					</a>
				</li>
			</ul>
		</main>
	)
}

export default StoriesIndexPage

export const Head: HeadFC = () => <title>Stories</title>
