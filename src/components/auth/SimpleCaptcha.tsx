"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SimpleCaptchaProps {
  onValidate: (isValid: boolean) => void;
  className?: string;
}

export function SimpleCaptcha({ onValidate, className }: SimpleCaptchaProps) {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [operation, setOperation] = useState<"+" | "-" | "*">("+");

  // Gerar nova pergunta
  const generateQuestion = () => {
    const operations: Array<"+" | "-" | "*"> = ["+", "-", "*"];
    const randomOp = operations[Math.floor(Math.random() * operations.length)];

    let n1, n2;

    switch (randomOp) {
      case "+":
        n1 = Math.floor(Math.random() * 20) + 1; // 1-20
        n2 = Math.floor(Math.random() * 20) + 1; // 1-20
        break;
      case "-":
        n1 = Math.floor(Math.random() * 20) + 10; // 10-29
        n2 = Math.floor(Math.random() * 10) + 1; // 1-10
        // Garantir que n1 > n2 para não dar negativo
        if (n1 < n2) [n1, n2] = [n2, n1];
        break;
      case "*":
        n1 = Math.floor(Math.random() * 10) + 1; // 1-10
        n2 = Math.floor(Math.random() * 10) + 1; // 1-10
        break;
    }

    setNum1(n1!);
    setNum2(n2!);
    setOperation(randomOp);
    setUserAnswer("");
    setIsValid(false);
    onValidate(false);
  };

  // Calcular resposta correta
  const getCorrectAnswer = (): number => {
    switch (operation) {
      case "+":
        return num1 + num2;
      case "-":
        return num1 - num2;
      case "*":
        return num1 * num2;
      default:
        return 0;
    }
  };

  // Verificar resposta do usuário
  const handleAnswerChange = (value: string) => {
    setUserAnswer(value);

    const answer = parseInt(value);
    if (isNaN(answer)) {
      setIsValid(false);
      onValidate(false);
      return;
    }

    const correct = getCorrectAnswer();
    const valid = answer === correct;

    setIsValid(valid);
    onValidate(valid);
  };

  // Gerar pergunta inicial
  useEffect(() => {
    generateQuestion();
  }, []);

  const getOperationSymbol = () => {
    switch (operation) {
      case "+":
        return "+";
      case "-":
        return "−";
      case "*":
        return "×";
    }
  };

  const getOperationName = () => {
    switch (operation) {
      case "+":
        return "soma";
      case "-":
        return "subtração";
      case "*":
        return "multiplicação";
    }
  };

  return (
    <div className={cn("", className)}>
      <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-1.5">
        <div className="flex items-center justify-center gap-1.5">
          <span className="text-xs text-gray-600 dark:text-gray-400 mr-1">
            Verificação:
          </span>
          <div className="text-sm font-bold text-[var(--cl-teal)] dark:text-blue-400 w-6 text-center bg-[var(--cl-surface)] rounded px-1">
            {num1}
          </div>
          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
            {getOperationSymbol()}
          </span>
          <div className="text-sm font-bold text-[var(--cl-teal)] dark:text-blue-400 w-6 text-center bg-[var(--cl-surface)] rounded px-1">
            {num2}
          </div>
          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
            =
          </span>
          <Input
            id="captcha-answer"
            type="number"
            value={userAnswer}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder="?"
            className={cn(
              "w-12 h-6 text-center text-xs font-semibold p-0.5",
              userAnswer &&
                isValid &&
                "border-green-500 bg-green-50 dark:bg-green-950/20",
              userAnswer &&
                !isValid &&
                "border-red-500 bg-red-50 dark:bg-red-950/20",
            )}
          />
          {userAnswer && (
            <span
              className={cn(
                "text-[10px] font-medium ml-1",
                isValid
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400",
              )}
            >
              {isValid ? "✓" : "✗"}
            </span>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={generateQuestion}
            className="h-5 w-5 p-0 ml-1"
            title="Nova pergunta"
          >
            <RefreshCw className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Hook para gerenciar CAPTCHA em formulários
export function useCaptcha() {
  const [isCaptchaValid, setIsCaptchaValid] = useState(false);
  const [captchaAttempts, setCaptchaAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);

  const handleCaptchaValidate = (isValid: boolean) => {
    setIsCaptchaValid(isValid);

    if (!isValid && captchaAttempts > 0) {
      setCaptchaAttempts((prev) => prev + 1);

      // Bloquear após 5 tentativas erradas
      if (captchaAttempts >= 5) {
        setIsBlocked(true);
        setTimeout(() => {
          setIsBlocked(false);
          setCaptchaAttempts(0);
        }, 60000); // 1 minuto de bloqueio
      }
    }
  };

  const resetCaptcha = () => {
    setIsCaptchaValid(false);
    setCaptchaAttempts(0);
    setIsBlocked(false);
  };

  return {
    isCaptchaValid,
    isBlocked,
    captchaAttempts,
    handleCaptchaValidate,
    resetCaptcha,
  };
}
