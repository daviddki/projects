from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('project1.html')

@app.route('/projects')
def projects():
    return render_template('projects.html')

@app.route('/index')
def index():
    return render_template('index.html')

@app.route('/project1')
def project1():
    return render_template('project1.html')

if __name__ == '__main__':
    app.run(debug=True)