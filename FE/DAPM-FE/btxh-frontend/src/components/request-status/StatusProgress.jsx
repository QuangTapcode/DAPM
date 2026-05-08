export default function StatusProgress({
    steps,
    status,
    getCurrentStep,
    getProgressWidth,
}) {
    const currentStep = getCurrentStep(status);

    return (
        <div className="mt-10 rounded-[24px] border border-[#E7EEF9] bg-[#FBFDFF] px-4 py-6 md:px-8">
            <div className="relative px-1">
                <div className="absolute left-[6%] right-[6%] top-4 h-[4px] rounded-full bg-[#E6EEF8]" />

                <div
                    className="absolute left-[6%] top-4 h-[4px] rounded-full bg-[#6E8FC7] transition-all"
                    style={{
                        width: `calc(${getProgressWidth(currentStep)} - 12%)`,
                    }}
                />

                <div className="relative grid grid-cols-4 gap-2">
                    {steps.map((step) => {
                        const isDone = step.key <= currentStep;
                        const isCurrent = step.key === currentStep;

                        return (
                            <div key={step.key} className="flex flex-col items-center text-center">
                                <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${isDone
                                            ? isCurrent
                                                ? 'bg-[#5F81BC] text-white ring-4 ring-[#DCE8F9]'
                                                : 'bg-[#5F81BC] text-white'
                                            : 'bg-[#E9EEF5] text-[#8190A3]'
                                        }`}
                                >
                                    {step.key}
                                </div>

                                <p className="mt-3 text-[11px] font-bold uppercase text-[#7C8DA4]">
                                    {step.label}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}