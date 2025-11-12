const AlephsramosdevWidget = ({ 
    utmSource = 'shop-fastsistemasconstrutivos', 
    utmMedium = 'footer', 
    utmCampaign = 'unitycompany' 
}) => {
    return (
        <>
            <style jsx>{`
                @import url('https://fonts.googleapis.com/css2?family=Urbanist:ital@1&display=swap');
            `}</style>
            <p 
                className="alephsramosdev-widget"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    fontSize: '14px',
                    width: 'fit-content',
                    padding: '2px 8px 2px 2px',
                    borderRadius: '8px',
                    backgroundColor: '#000000',
                    cursor: 'pointer'
                }}
            >
                <a 
                    href={`https://www.alephsramosdev.com.br?utm_source=${utmSource}&utm_medium=${utmMedium}&utm_campaign=${utmCampaign}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        textDecoration: 'none',
                        color: '#ffffff',
                        fontFamily: "'Urbanist', sans-serif",
                        fontWeight: 400,
                        fontStyle: 'italic',
                        fontSize: '14px',
                        lineHeight: '100%'
                    }}
                >
                    <img 
                        src="https://www.alephsramosdev.com.br/alephsramosdev-icon.png" 
                        alt="project-by-alephsramosdev" 
                        loading="eager"
                        style={{
                            width: '22px',
                            height: '22px',
                            objectFit: 'contain',
                        }}
                    />
                    @alephsramosdev
                </a>
            </p>
        </>
    );
};

export default AlephsramosdevWidget;
