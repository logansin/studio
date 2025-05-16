
"use client";

import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Wand2, ArrowLeft, ArrowRight } from 'lucide-react';
import { Progress } from "@/components/ui/progress";


import { quizQuestions } from '@/lib/quizData';
import type { QuizQuestion, QuizFormData, AnimeRecommendation } from '@/lib/types';
import { generateAnimeRecommendations, type GenerateAnimeRecommendationsInput } from '@/ai/flows/generate-anime-recommendations';
import { useToast } from '@/hooks/use-toast';

interface QuizFormProps {
  onQuizComplete: (recommendations: AnimeRecommendation[]) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

const createValidationSchema = () => {
  const schemaFields: Record<string, z.ZodTypeAny> = {};
  quizQuestions.forEach(q => {
    let fieldSchema: z.ZodTypeAny;
    if (q.type === 'checkbox') {
      fieldSchema = z.array(z.string());
      if (q.id === 'q1') {
        fieldSchema = fieldSchema.min(1, "Пожалуйста, выберите хотя бы один жанр.").max(3, "Пожалуйста, выберите до 3 жанров.");
      } else if (q.id === 'q5') {
         fieldSchema = fieldSchema.max(3, "Пожалуйста, выберите до 3 тем.");
      } else if (q.required) {
        fieldSchema = fieldSchema.min(1, "Пожалуйста, выберите хотя бы один вариант.");
      }
    } else if (q.type === 'radio') {
      fieldSchema = z.string(q.required ? { required_error: "Пожалуйста, выберите вариант." } : {});
      if (q.required) {
         fieldSchema = fieldSchema.min(1, "Пожалуйста, выберите вариант.");
      }
    } else {
      fieldSchema = z.string();
      if (q.required) {
        fieldSchema = fieldSchema.min(1, "Это поле обязательно для заполнения.");
      }
    }
    schemaFields[q.fieldName] = q.required ? fieldSchema : fieldSchema.optional();
  });
  return z.object(schemaFields);
};

const quizSchema = createValidationSchema();

export function QuizForm({ onQuizComplete, onLoadingChange }: QuizFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);

  const form = useForm<QuizFormData>({
    resolver: zodResolver(quizSchema),
    defaultValues: quizQuestions.reduce((acc, q) => {
      acc[q.fieldName] = q.type === 'checkbox' ? [] : '';
      return acc;
    }, {} as QuizFormData),
    mode: 'onChange', 
  });

  const onSubmit: SubmitHandler<QuizFormData> = (data) => {
    const fullValidationSchema = z.object(
      quizQuestions.reduce((acc, q) => {
        let fieldSchema: z.ZodTypeAny;
        if (q.type === 'checkbox') {
          fieldSchema = z.array(z.string());
          if (q.id === 'q1') fieldSchema = fieldSchema.min(1, "Пожалуйста, выберите хотя бы один жанр.").max(3, "Пожалуйста, выберите до 3 жанров.");
          else if (q.id === 'q5') fieldSchema = fieldSchema.max(3, "Пожалуйста, выберите до 3 тем.");
          else if (q.required) fieldSchema = fieldSchema.min(1, "Пожалуйста, выберите хотя бы один вариант.");
        } else if (q.type === 'radio') {
          fieldSchema = z.string(q.required ? { required_error: "Пожалуйста, выберите вариант." } : {});
          if (q.required) fieldSchema = fieldSchema.min(1, "Пожалуйста, выберите вариант.");
        } else { 
          fieldSchema = z.string();
          if (q.required) fieldSchema = fieldSchema.min(1, "Это поле обязательно для заполнения.");
        }
        acc[q.fieldName] = q.required ? fieldSchema : fieldSchema.optional(); 
        return acc;
      }, {} as Record<string, z.ZodTypeAny>)
    );

    const validationResult = fullValidationSchema.safeParse(data);
    if (!validationResult.success) {
      // console.error("Final validation failed:", validationResult.error.flatten().fieldErrors);
      Object.entries(validationResult.error.flatten().fieldErrors).forEach(([fieldName, errors]) => {
        if (errors) {
          form.setError(fieldName as keyof QuizFormData, { type: 'manual', message: errors.join(', ') });
        }
      });
      toast({
        title: "Ошибка валидации",
        description: "Пожалуйста, проверьте все ответы на вопросы. Возможно, некоторые обязательные вопросы пропущены.",
        variant: "destructive",
      });
      for (let i = 0; i < quizQuestions.length; i++) {
        const qField = quizQuestions[i].fieldName as keyof QuizFormData;
        if (validationResult.error.flatten().fieldErrors[qField]) {
          setCurrentStep(i);
          break;
        }
      }
      return;
    }

    onLoadingChange(true);
    startTransition(async () => {
      try {
        const quizAnswers: string[] = [];
        const preferenceParts: string[] = [];

        quizQuestions.forEach(q => {
          const answer = data[q.fieldName];
          let answerString = '';
          let preferenceString = '';

          if (q.type === 'checkbox' && Array.isArray(answer) && answer.length > 0) {
            answerString = answer.join(', ');
            preferenceString = `${q.text.replace(/\(.*?\)/g, '').trim()}: ${answerString}.`;
          } else if (q.type === 'radio' && typeof answer === 'string' && answer) {
            answerString = answer;
            preferenceString = `${q.text.replace(/\(.*?\)/g, '').trim()}: ${answerString}.`;
          } else if (q.type === 'text' && typeof answer === 'string' && answer.trim()) {
            answerString = answer.trim();
            if (answerString) {
               preferenceString = `Ранее понравившиеся аниме: ${answerString}.`;
            }
          }
          
          if (answerString) quizAnswers.push(answerString);
          if (preferenceString) preferenceParts.push(preferenceString);
        });
        
        const preferencesSummary = preferenceParts.join(' ');
        // console.log("Quiz Answers for AI:", quizAnswers);
        // console.log("Preferences Summary for AI:", preferencesSummary);

        const aiInput: GenerateAnimeRecommendationsInput = {
          quizAnswers,
          preferences: preferencesSummary,
        };
        
        const result = await generateAnimeRecommendations(aiInput);
        // console.log("AI Result from quiz flow:", result);
        
        onQuizComplete(result.recommendations);

      } catch (error: any) {
        // console.error("Ошибка генерации рекомендаций в QuizForm:", error.message, error.stack);
        toast({
          title: "Ошибка",
          description: "Не удалось сгенерировать рекомендации. Пожалуйста, попробуйте еще раз.",
          variant: "destructive",
        });
        onQuizComplete([]); 
      } finally {
        onLoadingChange(false);
      }
    });
  };

  const handleNext = async () => {
    const currentQuestion = quizQuestions[currentStep];
    const isValid = await form.trigger(currentQuestion.fieldName as keyof QuizFormData);
    if (!isValid && currentQuestion.required) {
      // console.log(`Validation failed for step ${currentStep}, field ${currentQuestion.fieldName}`);
      return; 
    }
    if (currentStep < quizQuestions.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1); // Corrected from prev + 1
    }
  };

  const activeQuestion = quizQuestions[currentStep];
  const progressValue = ((currentStep + 1) / quizQuestions.length) * 100;

  return (
    <Card className="w-full max-w-lg mx-auto shadow-2xl rounded-xl bg-card/50 dark:bg-card/60"> {/* Removed backdrop-blur-sm */}
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-xl font-semibold text-center text-primary">Опрос по предпочтениям</CardTitle>
        <CardDescription className="text-center text-sm mt-1 text-muted-foreground">
          Ответьте на вопросы, чтобы получить персональные рекомендации!
        </CardDescription>
         <div className="pt-2">
          <Progress value={progressValue} className="w-full h-2" />
          <p className="text-xs text-center text-muted-foreground mt-1">
            Вопрос {currentStep + 1} из {quizQuestions.length}
          </p>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <div className="min-h-[180px] flex flex-col justify-center px-2">
              <FormField
                control={form.control}
                name={activeQuestion.fieldName}
                key={activeQuestion.id} 
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-sm font-medium">{currentStep + 1}. {activeQuestion.text}</FormLabel>
                    {activeQuestion.description && <FormDescription className="text-xs">{activeQuestion.description}</FormDescription>}
                    <FormControl>
                      <div>
                        {activeQuestion.type === 'radio' && activeQuestion.options && (
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value as string || ''}
                            className="space-y-0.5 pt-1" 
                          >
                            {activeQuestion.options.map(option => (
                              <FormItem key={option.value} className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value={option.value} id={`${activeQuestion.id}-${option.value}`} />
                                </FormControl>
                                <Label htmlFor={`${activeQuestion.id}-${option.value}`} className="font-normal text-xs cursor-pointer">
                                  {option.label}
                                </Label>
                              </FormItem>
                            ))}
                          </RadioGroup>
                        )}
                        {activeQuestion.type === 'checkbox' && activeQuestion.options && (
                          <div className="space-y-0.5 pt-1"> 
                            {activeQuestion.options.map(option => (
                              <FormItem key={option.value} className="flex flex-row items-start space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={(field.value as string[])?.includes(option.value)}
                                    onCheckedChange={(checked) => {
                                      const currentValue = field.value as string[] || [];
                                      return checked
                                        ? field.onChange([...currentValue, option.value])
                                        : field.onChange(
                                            currentValue?.filter(
                                              (value) => value !== option.value
                                            )
                                          );
                                    }}
                                    id={`${activeQuestion.id}-${option.value}`}
                                  />
                                </FormControl>
                                <Label htmlFor={`${activeQuestion.id}-${option.value}`} className="font-normal text-xs cursor-pointer">
                                  {option.label}
                                </Label>
                              </FormItem>
                            ))}
                          </div>
                        )}
                        {activeQuestion.type === 'text' && (
                          <Input {...field} value={field.value as string || ''} placeholder="например, Атака Титанов, Твоё имя" className="text-xs h-9 mt-1" /> 
                        )}
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs pt-1" />
                  </FormItem>
                )}
              />
            </div>
            
            <Separator className="my-2 bg-border/50" />

            <div className="flex justify-between items-center pt-1">
              <Button
                type="button"
                onClick={handlePrevious}
                disabled={currentStep === 0 || isPending}
                variant="outline"
                size="sm"
                className="text-xs bg-card/70 hover:bg-card/90"
              >
                <ArrowLeft className="mr-1 h-3 w-3" />
                Назад
              </Button>

              {currentStep < quizQuestions.length - 1 && (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={isPending}
                  variant="default"
                  size="sm"
                  className="text-xs"
                >
                  Далее
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              )}

              {currentStep === quizQuestions.length - 1 && (
                <Button
                  type="submit"
                  disabled={isPending}
                  className="text-xs py-2.5 bg-accent hover:bg-accent/90 h-9"
                  size="sm"
                >
                  {isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  ) : (
                    <Wand2 className="mr-2 h-4 w-4" />
                  )}
                  Получить мои рекомендации
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
