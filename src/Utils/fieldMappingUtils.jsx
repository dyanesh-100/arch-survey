import axiosInstanceDirectus from '../axiosInstanceDirectus';

export async function getFieldsOnly(collectionName) {
  try {
    const response = await axiosInstanceDirectus.get(`/fields/${collectionName}`);
    const allFields = response.data.data.map(item => item.field);
    const excludedFields = {
      applications: [
        "surveyStatus",
        "uuid",
        "application_stakeholders",
        "survey_responses",
        "unMappedCMDBFields"
      ],
      questions: [
        "id",
        "question_id",
        "user_created",
        "date_created",
        "user_updated",
        "date_updated"
      ]
    };
    return allFields.filter(field => !(excludedFields[collectionName] || []).includes(field));
  } catch (error) {
    console.error(`Error fetching fields for ${collectionName}:`, error.message);
    return [];
  }
}

export async function buildSampleDbFields() {
  const collections = ['applications', 'questions'];
  const sampleDbFields = {};

  await Promise.all(
    collections.map(async (collection) => {
      sampleDbFields[collection] = await getFieldsOnly(collection);
    })
  );

  return sampleDbFields;
}

export function getMappedField(mappings, dbField) {
  const mapping = mappings.find(m => m.dbField === dbField);
  return mapping ? mapping.csvField : null;
}