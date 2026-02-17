/**
 * Warning banner component to display track validation issues
 */
export default function WarningBanner({ warnings }) {
    if (!warnings || warnings.length === 0) return null;

    return (
        <div style={container}>
            {warnings.map((warning, index) => (
                <div
                    key={index}
                    style={{
                        ...warningItem,
                        ...(warning.severity === 'error' ? errorStyle : warningStyle)
                    }}
                >
                    <span style={icon}>{warning.severity === 'error' ? '⚠️' : 'ℹ️'}</span>
                    <span style={message}>{warning.message}</span>
                </div>
            ))}
        </div>
    );
}

const container = {
    position: 'fixed',
    top: 16,
    right: 16,
    maxWidth: 400,
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    gap: 8
};

const warningItem = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
};

const errorStyle = {
    background: 'rgba(255, 59, 48, 0.95)',
    border: '1px solid rgba(255, 59, 48, 1)',
    color: '#fff'
};

const warningStyle = {
    background: 'rgba(255, 165, 0, 0.95)',
    border: '1px solid rgba(255, 165, 0, 1)',
    color: '#000'
};

const icon = {
    fontSize: 18,
    lineHeight: 1
};

const message = {
    flex: 1
};
