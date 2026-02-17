export default function LoadingIndicator() {
    return (
        <div className="loading" data-testid="loading">
            <div className="spinner" />
            <p>Connecting to server...</p>
        </div>
    );
}