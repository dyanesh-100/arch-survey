export default class DataValidator {
  static validateData(data, mappings, uploadType, getMappedFieldFn) {
    if (uploadType === 'applications') {
      return this.validateApplicationData(data, mappings, getMappedFieldFn);
    } else if (uploadType === 'questions') {
      return this.validateQuestionData(data, mappings, getMappedFieldFn);
    }
    return { isValid: true };
  }

  static validateApplicationData(data, mappings, getMappedFieldFn) {
    const errors = {
      duplicateIds: {},
      duplicateNames: {},
      invalidEmails: [],
      missingRequiredFields: []
    };

    const idField = getMappedFieldFn(mappings, 'applicationId');
    const nameField = getMappedFieldFn(mappings, 'applicationName');
    const businessOwnerField = getMappedFieldFn(mappings, 'businessOwner');
    const itOwnerField = getMappedFieldFn(mappings, 'itOwner');
    const engineeringOwnerField = getMappedFieldFn(mappings, 'engineeringOwner');
    const descriptionField = getMappedFieldFn(mappings, 'applicationDescription');
    const businessUnitField = getMappedFieldFn(mappings, 'businessUnit');
    const departmentField = getMappedFieldFn(mappings, 'applicationDepartment');

    const idCounts = {};
    const nameCounts = {};

    data.forEach((item, index) => {
      if (idField) {
        const applicationId = item[idField];
        if (applicationId) {
          idCounts[applicationId] = (idCounts[applicationId] || 0) + 1;
        } else {
          errors.missingRequiredFields.push({
            record: index + 1,
            field: 'applicationId',
            mappedField: idField
          });
        }
      }
      
      if (nameField) {
        const applicationName = item[nameField];
        if (applicationName) {
          nameCounts[applicationName] = (nameCounts[applicationName] || 0) + 1;
        } else {
          errors.missingRequiredFields.push({
            record: index + 1,
            field: 'applicationName',
            mappedField: nameField
          });
        }
      }

      const requiredFields = [
        { field: 'businessOwner', mappedField: businessOwnerField },
        { field: 'itOwner', mappedField: itOwnerField },
        { field: 'engineeringOwner', mappedField: engineeringOwnerField },
        { field: 'applicationDescription', mappedField: descriptionField },
        { field: 'businessUnit', mappedField: businessUnitField },
        { field: 'applicationDepartment', mappedField: departmentField }
      ];

      requiredFields.forEach(({ field, mappedField }) => {
        if (mappedField && !item[mappedField]) {
          errors.missingRequiredFields.push({
            record: index + 1,
            field: field,
            mappedField: mappedField
          });
        }
      });

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidFields = [];
      
      if (businessOwnerField && item[businessOwnerField] && !emailRegex.test(item[businessOwnerField])) {
        invalidFields.push('businessOwner');
      }
      if (itOwnerField && item[itOwnerField] && !emailRegex.test(item[itOwnerField])) {
        invalidFields.push('itOwner');
      }
      if (engineeringOwnerField && item[engineeringOwnerField] && !emailRegex.test(item[engineeringOwnerField])) {
        invalidFields.push('engineeringOwner');
      }
      
      if (invalidFields.length > 0) {
        errors.invalidEmails.push({
          record: index + 1,
          applicationId: idField ? item[idField] : undefined,
          applicationName: nameField ? item[nameField] : undefined,
          invalidFields
        });
      }
    });

    errors.duplicateIds = Object.fromEntries(
      Object.entries(idCounts).filter(([_, count]) => count > 1)
    );
    errors.duplicateNames = Object.fromEntries(
      Object.entries(nameCounts).filter(([_, count]) => count > 1)
    );

    const hasErrors = 
      Object.keys(errors.duplicateIds).length > 0 ||
      Object.keys(errors.duplicateNames).length > 0 ||
      errors.invalidEmails.length > 0 ||
      errors.missingRequiredFields.length > 0;
    
    return {
      isValid: !hasErrors,
      errors: hasErrors ? errors : null
    };
  }

  static validateQuestionData(data, mappings, getMappedFieldFn) {
    const errors = {
      duplicateEvaluationParams: {},
      duplicateQuestions: {},
      missingRequiredFields: []
    };

    const evaluationParamField = getMappedFieldFn(mappings, 'evaluation_parameter');
    const questionField = getMappedFieldFn(mappings, 'question');
    const questionTypeField = getMappedFieldFn(mappings, 'question_type');
    const responseTypeField = getMappedFieldFn(mappings, 'response_type');
    const questionGroupField = getMappedFieldFn(mappings, 'question_group');
    const weightageField = getMappedFieldFn(mappings, 'weightage');
    const requiredFields = [
      { dbField: 'evaluation_parameter', mappedField: evaluationParamField },
      { dbField: 'question', mappedField: questionField },
      { dbField: 'response_type', mappedField: responseTypeField },
      { dbField: 'question_group', mappedField: questionGroupField }
    ];

    const evalParamCounts = {};
    const questionCounts = {};

    data.forEach((item, index) => {
      requiredFields.forEach(({ dbField, mappedField }) => {
        if (mappedField && !item[mappedField]) {
          errors.missingRequiredFields.push({
            record: index + 1,
            field: dbField,
            mappedField: mappedField
          });
        }
      });
      
      if (questionField) {
        const question = item[questionField];
        if (question) {
          questionCounts[question] = (questionCounts[question] || 0) + 1;
        } else {
          errors.missingRequiredFields.push({
            record: index + 1,
            field: 'question',
            mappedField: questionField
          });
        }
      }
      
      if (questionTypeField && !item[questionTypeField]) {
        errors.missingRequiredFields.push({
          record: index + 1,
          field: 'question_type',
          mappedField: questionTypeField
        });
      }

      if (weightageField && !item[weightageField]) {
        errors.missingRequiredFields.push({
          record: index + 1,
          field: 'weightage',
          mappedField: weightageField
        });
      }
    });

    errors.duplicateEvaluationParams = Object.fromEntries(
      Object.entries(evalParamCounts).filter(([_, count]) => count > 1)
    );
    errors.duplicateQuestions = Object.fromEntries(
      Object.entries(questionCounts).filter(([_, count]) => count > 1)
    );

    const hasErrors = 
      Object.keys(errors.duplicateEvaluationParams).length > 0 ||
      Object.keys(errors.duplicateQuestions).length > 0 ||
      errors.missingRequiredFields.length > 0;

    return {
      isValid: !hasErrors,
      errors: hasErrors ? errors : null
    };
  }

  static filterValidData(data, errors, uploadType, mappings) {
    if (!errors) return data;
    
    return data.filter((row, index) => {
      if (uploadType === 'applications') {
        const rowId = row['applicationId'];
        const hasErrors = 
          (errors.duplicateIds && errors.duplicateIds[rowId] > 1) ||
          (errors.duplicateNames && errors.duplicateNames[row.applicationName] > 1) ||
          (errors.invalidEmails && errors.invalidEmails.some(e => e.record === index + 1)) ||
          (errors.missingRequiredFields && errors.missingRequiredFields.some(e => e.record === index + 1));
        
        return !hasErrors;
      } else if (uploadType === 'questions') {
        const evalParamField = mappings.find(m => m.dbField === 'evaluation_parameter')?.csvField;
        const questionField = mappings.find(m => m.dbField === 'question')?.csvField;
        
        const hasErrors = 
          (evalParamField && errors.duplicateEvaluationParams && 
          errors.duplicateEvaluationParams[row[evalParamField]] > 1) ||
          (questionField && errors.duplicateQuestions && 
          errors.duplicateQuestions[row[questionField]] > 1) ||
          (errors.missingRequiredFields && 
          errors.missingRequiredFields.some(e => e.record === index + 1));
        
        return !hasErrors;
      }
      
      return true;
    });
  }

  static getFailedRecords(data, validationErrors, mappings, uploadType, getMappedFieldFn) {
    if (!validationErrors || !data.length) return [];
    
    let recordsWithIssues = [];
    
    if (uploadType === 'applications') {
      const duplicateIds = validationErrors.duplicateIds;
      const duplicateNames = validationErrors.duplicateNames;
      
      recordsWithIssues = data.map((record, index) => {
        const issues = [];
        
        const idField = getMappedFieldFn(mappings, 'applicationId');
        if (idField && duplicateIds[record[idField]]) {
          issues.push(`Duplicate Application ID (${record[idField]} appears ${duplicateIds[record[idField]]} times)`);
        }
        
        const nameField = getMappedFieldFn(mappings, 'applicationName');
        if (nameField && duplicateNames[record[nameField]]) {
          issues.push(`Duplicate Application Name ("${record[nameField]}" appears ${duplicateNames[record[nameField]]} times)`);
        }
        
        const emailError = validationErrors.invalidEmails.find(
          err => err.record === index + 1
        );
        if (emailError) {
          emailError.invalidFields.forEach(field => {
            const fieldName = getMappedFieldFn(mappings, field);
            issues.push(`Invalid email in ${field} (${record[fieldName]})`);
          });
        }
        
        validationErrors.missingRequiredFields.forEach(error => {
          if (error.record === index + 1) {
            issues.push(`Missing required field: ${error.field} (mapped from ${error.mappedField})`);
          }
        });
        
        return {
          ...record,
          Reason: issues.length > 0 ? issues.join('; ') : 'Valid'
        };
      });
    } else if (uploadType === 'questions') {
      const duplicateEvalParams = validationErrors.duplicateEvaluationParams;
      const duplicateQuestions = validationErrors.duplicateQuestions;
      
      recordsWithIssues = data.map((record, index) => {
        const issues = [];
        
        const evalParamField = getMappedFieldFn(mappings, 'evaluation_parameter');
        if (evalParamField && duplicateEvalParams[record[evalParamField]]) {
          issues.push(`Duplicate Evaluation Parameter ("${record[evalParamField]}" appears ${duplicateEvalParams[record[evalParamField]]} times)`);
        }
        
        const questionField = getMappedFieldFn(mappings, 'question');
        if (questionField && duplicateQuestions[record[questionField]]) {
          issues.push(`Duplicate Question ("${record[questionField]}" appears ${duplicateQuestions[record[questionField]]} times)`);
        }
        
        validationErrors.missingRequiredFields.forEach(error => {
          if (error.record === index + 1) {
            issues.push(`Missing required field: ${error.field} (mapped from ${error.mappedField})`);
          }
        });
        
        return {
          ...record,
          Reason: issues.length > 0 ? issues.join('; ') : 'Valid'
        };
      });
    }
    
    return recordsWithIssues.filter(record => record.Reason !== 'Valid');
  }
}