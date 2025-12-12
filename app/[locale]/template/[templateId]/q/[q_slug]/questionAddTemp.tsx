const buildResearchOutputFormState = (parsed: AnyParsedQuestion | null) => {
  const columns: any[] = [];

  standardFields.forEach(field => {
    if (!field.enabled) return;

    switch (field.id) {
      case 'title':
        columns.push({
          heading: field.label || 'Title',
          content: {
            type: 'text',
            attributes: {
              label: field.label || 'Title',
              help: field.helpText || '',
              maxLength: 500,
              minLength: 1
            }
          }
        });
        break;

      case 'description':
        columns.push({
          heading: field.label || 'Description',
          content: {
            type: 'textArea',
            attributes: {
              label: field.label || 'Description',
              help: field.helpText || '',
              maxLength: field.maxLength ? Number(field.maxLength) : undefined,
              asRichText: true,
              rows: 4
            }
          }
        });
        break;

      case 'outputType': {
        const outputTypeOptions: any[] = [];
        if (field.outputTypeConfig?.mode === 'defaults' || !field.outputTypeConfig?.mode) {
          field.outputTypeConfig?.selectedDefaults?.forEach(defaultType => {
            const backendType = defaultResearchOutputTypesData?.defaultResearchOutputTypes?.find(
              (item) => item?.name === defaultType
            );
            outputTypeOptions.push({
              label: defaultType,
              value: backendType?.value || defaultType.toLowerCase().replace(/\s+/g, '-')
            });
          });
        }
        if (field.outputTypeConfig?.mode === 'mine' || !field.outputTypeConfig?.mode) {
          field.outputTypeConfig?.customTypes?.forEach(customType => {
            outputTypeOptions.push({
              label: customType.type || '',
              value: customType.type?.toLowerCase().replace(/\s+/g, '-') || ''
            });
          });
        }
        columns.push({
          heading: field.label || 'Output Type',
          content: {
            type: 'selectBox',
            attributes: {
              label: field.label || 'Output Type',
              help: field.helpText || '',
              multiple: false
            },
            options: outputTypeOptions
          }
        });
        break;
      }

      case 'dataFlags':
        if (field.flagsConfig?.showSensitiveData) {
          columns.push({
            heading: 'Sensitive Data',
            content: {
              type: 'checkBoxes',
              attributes: {
                label: 'Data Flags',
                help: field.helpText || '',
                labelTranslationKey: 'researchOutput.dataFlags.heading'
              },
              options: [{
                label: 'May contain sensitive data?',
                value: 'sensitive',
                checked: false
              }]
            }
          });
        }
        if (field.flagsConfig?.showPersonalData) {
          columns.push({
            heading: 'Personal Data',
            content: {
              type: 'checkBoxes',
              attributes: {
                label: 'Data Flags',
                help: field.helpText || '',
                labelTranslationKey: 'researchOutput.dataFlags.heading'
              },
              options: [{
                label: 'May contain personally identifiable information?',
                value: 'personal',
                checked: false
              }]
            }
          });
        }
        break;

      case 'repoSelector': {
        const repoColumn: any = {
          heading: field.label || 'Repositories',
          content: {
            type: 'repositorySearch',
            attributes: {
              label: field.label || 'Repositories',
              help: field.helpText || ''
            },
            graphQL: {
              displayFields: [
                { propertyName: 'name', label: 'Name' },
                { propertyName: 'description', label: 'Description' },
                { propertyName: 'website', label: 'Website' },
                { propertyName: 'keywords', label: 'Subject Areas' }
              ],
              query: 'query Repositories($term: String, $keywords: [String!], $repositoryType: String, $paginationOptions: PaginationOptions){ repositories(term: $term, keywords: $keywords, repositoryType: $repositoryType, paginationOptions: $paginationOptions) { totalCount currentOffset limit hasNextPage hasPreviousPage availableSortFields items { id name uri description website keywords repositoryTypes } } }',
              responseField: 'repositories.items',
              variables: [
                { minLength: 3, label: 'Search for a repository', name: 'term', type: 'string' },
                { minLength: 3, label: 'Subject Areas', name: 'keywords', type: 'string' },
                { minLength: 3, label: 'Repository type', name: 'repositoryType', type: 'string' },
                { label: 'Pagination Options', name: 'paginationOptions', type: 'paginationOptions', options: { type: 'OFFSET', limit: 10, offset: 0, sortField: 'name', sortOrder: 'ASC' } }
              ],
              queryId: 'useRepositoriesQuery',
              answerField: 'uri'
            }
          }
        };
        if (field.repoConfig?.customRepos && field.repoConfig.customRepos.length > 0) {
          repoColumn.preferences = field.repoConfig.customRepos.map(repo => ({
            id: repo.uri,
            label: repo.name,
            value: repo.uri || ''
          }));
        }
        columns.push(repoColumn);
        break;
      }

      case 'metadataStandards': {
        const metadataColumn: any = {
          heading: field.label || 'Metadata Standards',
          content: {
            type: 'metadataStandardSearch',
            attributes: {
              label: field.label || 'Metadata Standards',
              help: field.helpText || ''
            },
            graphQL: {
              displayFields: [
                { propertyName: 'name', label: 'Name' },
                { propertyName: 'description', label: 'Description' },
                { propertyName: 'website', label: 'Website' },
                { propertyName: 'keywords', label: 'Subject Areas' }
              ],
              query: 'query MetadataStandards($term: String, $keywords: [String!], $paginationOptions: PaginationOptions){ metadataStandards(term: $term, keywords: $keywords, paginationOptions: $paginationOptions) { totalCount currentOffset limit hasNextPage hasPreviousPage availableSortFields items { id name uri description keywords } } }',
              responseField: 'metadataStandards.items',
              variables: [
                { minLength: 3, label: 'Search for a metadata standard', name: 'term', type: 'string' },
                { minLength: 3, label: 'Subject Areas', name: 'keywords', type: 'string' },
                { label: 'Pagination Options', name: 'paginationOptions', type: 'paginationOptions', options: { type: 'OFFSET', limit: 10, offset: 0, sortField: 'name', sortOrder: 'ASC' } }
              ],
              queryId: 'useMetadataStandardsQuery',
              answerField: 'uri'
            }
          }
        };
        if (hasMetaDataConfig(field) && field.metaDataConfig?.customStandards && field.metaDataConfig.customStandards.length > 0) {
          metadataColumn.preferences = field.metaDataConfig.customStandards.map(standard => ({
            label: standard.name,
            value: standard.uri || (standard as any).url || ''
          }));
        }
        columns.push(metadataColumn);
        break;
      }

      case 'licenses': {
        const licenseColumn: any = {
          heading: field.label || 'Licenses',
          content: {
            type: 'licenseSearch',
            attributes: {
              label: field.label || 'Licenses',
              help: field.helpText || ''
            },
            graphQL: {
              displayFields: [
                { propertyName: 'name', label: 'Name' },
                { propertyName: 'description', label: 'Description' },
                { propertyName: 'recommended', label: 'Recommended' }
              ],
              query: 'query Licenses($term: String, $paginationOptions: PaginationOptions){ license(term: $term, paginationOptions: $paginationOptions) { totalCount currentOffset limit hasNextPage hasPreviousPage availableSortFields items { id name uri description } } }',
              responseField: 'licenses.items',
              variables: [
                { minLength: 3, label: 'Search for a license', name: 'term', type: 'string' },
                { label: 'Pagination Options', name: 'paginationOptions', type: 'paginationOptions' }
              ],
              answerField: 'uri'
            }
          }
        };

        if (field.licensesConfig?.mode === 'addToDefaults' && field.licensesConfig?.customTypes && field.licensesConfig.customTypes.length > 0) {
          licenseColumn.preferences = field.licensesConfig.customTypes.map(license => ({
            label: license.name,
            value: license.uri || ''
          }));
        } else {
          licenseColumn.preferences = [];
        }

        columns.push(licenseColumn);
        break;
      }

      case 'accessLevels': {
        const accessLevelOptions: any[] = [];
        if (field.accessLevelsConfig?.mode === 'defaults' || !field.accessLevelsConfig?.mode) {
          field.accessLevelsConfig?.selectedDefaults?.forEach(level => {
            accessLevelOptions.push({
              label: level,
              value: level
            });
          });
        }
        if (field.accessLevelsConfig?.mode === 'mine') {
          field.accessLevelsConfig?.customLevels?.forEach(customLevel => {
            accessLevelOptions.push({
              label: customLevel.label,
              value: customLevel.value
            });
          });
        }
        columns.push({
          heading: field.label || 'Initial Access Levels',
          content: {
            type: 'selectBox',
            attributes: {
              label: field.label || 'Initial Access Levels',
              help: field.helpText || '',
              multiple: false
            },
            options: accessLevelOptions
          }
        });
        break;
      }
    }
  });

  additionalFields.forEach(customField => {
    if (customField.enabled) {
      columns.push({
        heading: customField.customLabel || customField.label,
        content: {
          type: 'text',
          attributes: {
            label: customField.customLabel || customField.label,
            help: customField.helpText || '',
            maxLength: customField.maxLength ? Number(customField.maxLength) : undefined,
            defaultValue: customField.defaultValue || undefined
          }
        }
      });
    }
  });

  return {
    ...parsedQuestionJSON,
    columns,
    attributes: {
      ...(parsed && 'attributes' in parsed ? parsed.attributes : {}),
      label: '',
      help: '',
      canAddRows: true,
      canRemoveRows: true,
      initialRows: 1
    }
  };
};