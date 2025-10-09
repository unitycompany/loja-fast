import React from 'react'

export default function JsonLd({ data }){
	if (!data) return null
	try {
		const json = JSON.stringify(data)
		return (
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
		)
	} catch (e) {
		return null
	}
}
