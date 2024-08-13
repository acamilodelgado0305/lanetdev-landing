import React, { MouseEvent, ReactNode } from 'react';

interface FormCardProps {
    title: string;
    className?: string;
    showButtons?: boolean;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    submitButtonText?: string;
    Steps: ReactNode[];
    StepsCount: number;
    setStepsCount: React.Dispatch<React.SetStateAction<number>>;
    stepOrderValidation: (count: number) => Promise<boolean>;
    footer?: ReactNode;
}

const FormCard: React.FC<FormCardProps> = ({
    title,
    className,
    showButtons = true,
    onSubmit,
    submitButtonText = 'Enviar',
    Steps,
    StepsCount,
    setStepsCount,
    stepOrderValidation,
    footer,
}) => {
    const nextStep = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!(await stepOrderValidation(StepsCount))) return;

        if (StepsCount !== Steps.length) {
            setStepsCount((prevState) => prevState + 1);
        }
    };

    const backStep = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        if (StepsCount > 0) {
            setStepsCount((prevState) => prevState - 1);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className={`p-6 w-full max-w-lg bg-white border border-indigo-500 rounded-lg shadow-md ${className}`}>
                <h1 className="text-2xl font-bold text-center mb-6">{title}</h1>
                <form onSubmit={onSubmit}>
                    {Steps[StepsCount]}
                    {showButtons && (
                        <div className="flex justify-between mt-6">
                            {StepsCount > 0 && (
                                <button className="btn bg-gray-300 text-gray-800 py-2 px-4 rounded-md" onClick={backStep} type="button">
                                    Atrás
                                </button>
                            )}
                            {StepsCount === Steps.length - 1 ? (
                                <button className="btn bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700" type="submit">
                                    {submitButtonText}
                                </button>
                            ) : (
                                <button className="btn bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700" onClick={nextStep} type="button">
                                    Siguiente
                                </button>
                            )}
                        </div>
                    )}
                </form>
                {footer && <div className="mt-6">{footer}</div>}
            </div>
        </div>
    );
};

export default FormCard;
