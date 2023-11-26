import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.linear_model import Lasso
from sklearn.metrics import mean_squared_error
from joblib import dump

data = pd.read_csv('docs/evaluated_data.txt', delimiter=',')  # Assuming comma-delimited

# Define features and target variable
X = data[['PS', 'SOTW', 'RTS', 'PM', 'SLA', 'SC', 'TIME', 'CD', 'PC', 'ROT']]
y = data['SCORE']

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# Create the Lasso regression model
model = Lasso(random_state=42)

# Define the hyperparameters and their respective values to search through
param_grid = {
    'alpha': [0.001, 0.01, 0.1, 1, 10],  # Regularization strength (L1 penalty)
    'max_iter': [500, 1000, 2000],  # Maximum number of iterations
    'tol': [1e-5, 1e-4, 1e-3, 1e-2],  # Tolerance for stopping criteria
    'selection': ['cyclic', 'random']  # Method for feature selection ('cyclic' or 'random')
}

# Create GridSearchCV to find the best hyperparameters
grid_search = GridSearchCV(model, param_grid, scoring='neg_mean_squared_error', cv=5, verbose=1, n_jobs=-1)

# Fit the grid search to the training data
grid_search.fit(X_train, y_train)

# Get the best model and its parameters
best_model = grid_search.best_estimator_
best_params = grid_search.best_params_

# Make predictions on the test set using the best model
y_pred = best_model.predict(X_test)

# Evaluate the best model's performance
mse = mean_squared_error(y_test, y_pred)
# Calculate prediction accuracy in percentage
accuracy = 100 - (mse / np.var(y_test)) * 100

print(f'Best Model Parameters: {best_params}')
print(f'Best Model Prediction Accuracy: {accuracy:.2f}%')

# Save the best model
dump(best_model, 'model/my_model.joblib')

# Now, make a prediction for the given input [8, 3, 8, 0, 1, 9, 5, 2, 4, 3]
input_data = np.array([8, 3, 8, 0, 1, 9, 5, 2, 4, 3]).reshape(1, -1)  # Reshape to match the input format
