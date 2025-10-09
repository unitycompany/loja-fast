import React from 'react'
import styled, { keyframes } from 'styled-components'

const shimmer = keyframes`
	0% { background-position: -200px 0; }
	100% { background-position: calc(200px + 100%) 0; }
`

const Box = styled.div`
	display: block;
	background: #f0f0f0;
	background-image: linear-gradient(90deg, #f0f0f0 0px, #f7f7f7 40px, #f0f0f0 80px);
	background-size: 200px 100%;
	animation: ${shimmer} 1.2s ease-in-out infinite;
	border-radius: 8px;
`

export default function Skeleton({ width = '100%', height = 16, style }){
	return <Box style={{ width, height, ...style }} aria-hidden />
}
