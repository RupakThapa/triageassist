/**
 * Triage Form Component
 * Structured form for medical triage data entry
 */

'use client';

import { useForm, Controller } from 'react-hook-form';
import { VisitData, Medication } from '../types';
import { useEffect } from 'react';

interface TriageFormProps {
  initialData?: Partial<VisitData>;
  onSubmit: (data: VisitData) => void;
  isLoading?: boolean;
}

export function TriageForm({ initialData, onSubmit, isLoading }: TriageFormProps) {
  const { register, control, handleSubmit, reset, watch } = useForm<VisitData>({
    defaultValues: {
      visit_summary: '',
      vitals: {
        pain_level: null,
        pain_type: null,
        pain_location: null,
      },
      medications: [],
      consult_notes: {
        subjective: '',
        objective: '',
        plan: '',
      },
      ...initialData,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        visit_summary: initialData.visit_summary || '',
        vitals: {
          pain_level: initialData.vitals?.pain_level ?? null,
          pain_type: initialData.vitals?.pain_type || null,
          pain_location: initialData.vitals?.pain_location || null,
        },
        medications: initialData.medications || [],
        consult_notes: {
          subjective: initialData.consult_notes?.subjective || '',
          objective: initialData.consult_notes?.objective || '',
          plan: initialData.consult_notes?.plan || '',
        },
      });
    }
  }, [initialData, reset]);

  const medications = watch('medications') || [];

  const addMedication = () => {
    const currentMedications = watch('medications') || [];
    reset({
      ...watch(),
      medications: [
        ...currentMedications,
        { name: '', dosage: '', status: 'Current' as const },
      ],
    });
  };

  const removeMedication = (index: number) => {
    const currentMedications = watch('medications') || [];
    reset({
      ...watch(),
      medications: currentMedications.filter((_, i) => i !== index),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl mx-auto">
      <div className="mb-6">
        <label className="block mb-2 font-bold">Visit Summary</label>
        <textarea
          {...register('visit_summary')}
          rows={3}
          className="w-full p-3 border border-gray-300 rounded text-sm"
          placeholder="1-2 sentence professional summary"
        />
      </div>

      <div className="mb-6">
        <h3 className="mb-4">Vitals</h3>
        
        <div className="mb-4">
          <label className="block mb-2">Pain Level (0-10)</label>
          <Controller
            name="vitals.pain_level"
            control={control}
            render={({ field }) => (
              <div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  {...field}
                  value={field.value ?? 0}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                  className="w-full max-w-md"
                />
                <div className="mt-2">Value: {field.value ?? 'Not specified'}</div>
              </div>
            )}
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Pain Type</label>
          <select
            {...register('vitals.pain_type')}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="">Select pain type</option>
            <option value="Throbbing">Throbbing</option>
            <option value="Sharp">Sharp</option>
            <option value="Dull">Dull</option>
            <option value="Burning">Burning</option>
            <option value="Aching">Aching</option>
            <option value="Stabbing">Stabbing</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-2">Pain Location</label>
          <input
            type="text"
            {...register('vitals.pain_location')}
            placeholder="Body part"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
      </div>

      <div className="mb-6">
        <h3 className="mb-4">Medications</h3>
        {medications.map((med, index) => (
          <div
            key={index}
            className="flex gap-3 mb-3 p-3 border border-gray-300 rounded"
          >
            <input
              {...register(`medications.${index}.name`)}
              placeholder="Medication name"
              className="flex-2 p-2 border border-gray-300 rounded"
            />
            <input
              {...register(`medications.${index}.dosage`)}
              placeholder="Dosage"
              className="flex-1 p-2 border border-gray-300 rounded"
            />
            <select
              {...register(`medications.${index}.status`)}
              className="flex-1 p-2 border border-gray-300 rounded"
            >
              <option value="Current">Current</option>
              <option value="Prescribed">Prescribed</option>
              <option value="Discontinued">Discontinued</option>
            </select>
            <button
              type="button"
              onClick={() => removeMedication(index)}
              className="px-4 py-2 bg-red-600 text-white border-none rounded cursor-pointer"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addMedication}
          className="px-4 py-2 bg-green-600 text-white border-none rounded cursor-pointer"
        >
          Add Medication
        </button>
      </div>

      <div className="mb-6">
        <h3 className="mb-4">Consult Notes</h3>
        
        <div className="mb-4">
          <label className="block mb-2 font-bold">Subjective (Patient's verbal complaints)</label>
          <textarea
            {...register('consult_notes.subjective')}
            rows={4}
            className="w-full p-3 border border-gray-300 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-bold">Objective (Nurse's observations)</label>
          <textarea
            {...register('consult_notes.objective')}
            rows={4}
            className="w-full p-3 border border-gray-300 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-bold">Plan (Next steps)</label>
          <textarea
            {...register('consult_notes.plan')}
            rows={4}
            className="w-full p-3 border border-gray-300 rounded"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full p-4 text-white border-none rounded text-base font-bold ${
          isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 cursor-pointer'
        }`}
      >
        {isLoading ? 'Saving...' : 'Finalize & Save'}
      </button>
    </form>
  );
}

