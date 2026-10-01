export const ProgressBar = ({ p }: { p: number }) => (
  <div className="w-(--progress)" style={{ '--progress': `${p}%` }} />
)
