import { SPEC_SCHEMAS } from '../data/specSchemas';

export function SpecEditor({ subcategory, specs, onChange }) {
  const fields = SPEC_SCHEMAS[(subcategory || '').toLowerCase()] || [];

  if (!fields.length) {
    return (
      <p className="text-muted small mt-1 mb-0">
        No specification template for "<em>{subcategory || 'this subcategory'}</em>".
      </p>
    );
  }

  return (
    <div className="row g-2">
      {fields.map(field => (
        <div key={field.key} className="col-md-6">
          <label className="form-label small mb-1">{field.label}</label>
          {field.type === 'select' ? (
            <select
              className="form-select form-select-sm"
              value={specs[field.key] || ''}
              onChange={e => onChange(field.key, e.target.value)}
            >
              <option value="">Select</option>
              {field.options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              className="form-control form-control-sm"
              value={specs[field.key] || ''}
              onChange={e => onChange(field.key, e.target.value)}
              placeholder={field.placeholder || ''}
            />
          )}
        </div>
      ))}
    </div>
  );
}
