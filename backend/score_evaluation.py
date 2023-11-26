import pandas as pd
# Reload the dataset and define weights
data = pd.read_csv('docs/random_combination_dataset.txt')

# Define weights for each parameter (all weights are set to 1 as an example, but can be adjusted)
weights = {'PS': 1, 'SOTW': 1.15, 'RTS': 1, 'PM': 1, 'SLA': 1.15,
           'SC': 1, 'TIME': 1, 'CD': 0.75, 'PC': 1, 'ROT': 0.75}

# Calculate the weighted average for each row to get the SCORE
data['SCORE'] = data.apply(lambda row: sum(row[param] * weights[param] for param in weights) / sum(weights.values()), axis=1)

data['SCORE'] = data['SCORE'].round()
# Save the updated dataset with SCORE values to the specified path
evaluated_data_file_path = 'docs/evaluated_data.txt'
data.to_csv(evaluated_data_file_path, index=False)

