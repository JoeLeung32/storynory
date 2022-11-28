import * as React from "react"
import type {HeadFC, PageProps} from "gatsby"

const IndexPage: React.FC<PageProps> = () => {
	return (
		<main>
			<h1>Welcome to Storynory</h1>
			<a href={`./stories`}>Stories</a>
		</main>
	)
}

export default IndexPage

export const Head: HeadFC = () => <title>Home Page</title>
