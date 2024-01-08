export const getTrendColor = (trend, adjustment) => {
    return trend > 0
        ? {
            color: `rgb(${255 - trend / adjustment}, 255, ${255 - trend / adjustment})`,

        }
        : trend < 0
            ? {
                color: `rgb(255, ${255 + trend / adjustment}, ${255 + trend / adjustment})`
            }
            : {}
}